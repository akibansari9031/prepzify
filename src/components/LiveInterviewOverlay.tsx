import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Loader2, 
  User, 
  Bot,
  StopCircle,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { analyzeInterview } from '../services/interviewService';
import FeedbackReport from './FeedbackReport';
import { InterviewFeedback, InterviewMessage } from '../types';

interface LiveInterviewOverlayProps {
  mode: 'audio' | 'video';
  role: string;
  onClose: () => void;
}

// Internal UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-gray-900 border-gray-800 rounded-3xl overflow-hidden shadow-2xl ${className}`}>{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'ghost' | 'outline', 
  size?: 'sm' | 'md' | 'lg' | 'icon',
  disabled?: boolean,
  className?: string
}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    outline: "border border-gray-700 text-gray-300 hover:bg-gray-800",
    ghost: "text-gray-400 hover:text-white hover:bg-gray-800"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-8 py-3 text-base",
    icon: "p-2"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function LiveInterviewOverlay({ mode, role, onClose }: LiveInterviewOverlayProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(mode === 'video');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<InterviewMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  
  const isMicEnabledRef = useRef(isMicEnabled);
  useEffect(() => {
    isMicEnabledRef.current = isMicEnabled;
  }, [isMicEnabled]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const handleEndSession = async () => {
    if (!transcript.length) {
      onClose();
      return;
    }

    try {
      setIsAnalyzing(true);
      stopSession();
      const analysis = await analyzeInterview(transcript);
      setFeedback(analysis);
    } catch (err) {
      console.error("Analysis failed:", err);
      onClose();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setIsSessionActive(true);

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: mode === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
      }

      const apiKey = process.env.GEMINI_API_KEY!;
      const ai = new GoogleGenAI({ apiKey });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;
      nextPlaybackTimeRef.current = audioCtx.currentTime;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are "EliteInterviewer AI," a senior technical recruiter for BTech placements. 
          Conduct a high-stakes mock interview for the ${role} role.
          Guidelines:
          - ONE QUESTION AT A TIME.
          - Conversational, natural speech.
          - Multi-stage: Intro -> Technical (CS fund, DSA) -> HR.
          - Start by introducing yourself and asking for their name and branch.
          - Respond to their answers with brief validation before the next question.
          - If the student's answer is too short, probe deeper. If they are stuck, give a small hint to keep the conversation moving.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setupAudioInput(stream);
            if (mode === 'video') setupVideoInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            handleServerMessage(message);
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setError(`Connection error: ${err.message || "Session ended unexpectedly."}`);
          },
        },
      });

      sessionRef.current = session;
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Failed to start live session.");
      setIsConnecting(false);
    }
  };

  const setupAudioInput = (stream: MediaStream) => {
    if (!audioContextRef.current) return;
    const source = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);
    processorRef.current.onaudioprocess = (e) => {
      if (!isMicEnabledRef.current || !sessionRef.current) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = floatTo16BitPCM(inputData);
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
      });
    };
    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const setupVideoInput = () => {
    const interval = setInterval(() => {
      if (!isCamEnabled || !sessionRef.current || !videoRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        sessionRef.current.sendRealtimeInput({
          video: { data: base64, mimeType: 'image/jpeg' }
        });
      }
    }, 500);
    return () => clearInterval(interval);
  };

  const handleServerMessage = (message: any) => {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      playAudioChunk(base64Audio);
      setIsModelSpeaking(true);
    }

    if (message.serverContent?.interrupted) {
      nextPlaybackTimeRef.current = audioContextRef.current?.currentTime || 0;
    }

    const inputTranscript = message.inputTranscription?.transcript;
    const outputTranscript = message.outputTranscription?.transcript;

    if (inputTranscript) {
      setTranscript(prev => [...prev, { role: 'user', chunk: inputTranscript, timestamp: Date.now() }]);
    }
    if (outputTranscript) {
      setTranscript(prev => [...prev, { role: 'model', chunk: outputTranscript, timestamp: Date.now() }]);
      setIsModelSpeaking(false);
    }
  };

  const playAudioChunk = (base64: string) => {
    if (!audioContextRef.current) return;
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768;

    const buffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    const startTime = Math.max(audioContextRef.current.currentTime, nextPlaybackTimeRef.current);
    source.start(startTime);
    nextPlaybackTimeRef.current = startTime + buffer.duration;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    sessionRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  };

  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Int16Array(buffer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] flex flex-col gap-4"
      >
        <Card className="flex flex-col h-full relative border-none md:border md:border-gray-800">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-white font-bold flex items-center gap-2">
                {mode === 'video' ? 'AI Video Interview' : 'AI Voice Interview'}
                <span className="text-xs text-gray-400 font-normal">Active Session</span>
              </h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => (stopSession(), onClose())}>
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden min-h-0">
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-[300px]">
              {mode === 'video' ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover ${!isCamEnabled ? 'hidden' : ''}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <canvas ref={canvasRef} width={640} height={480} className="hidden" />
                  {!isCamEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500 gap-4">
                      <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                        <User size={40} />
                      </div>
                      <p className="text-sm font-medium">Camera is disabled</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                    <motion.div 
                      animate={isModelSpeaking ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-2xl"
                    />
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl relative z-10">
                      <Bot size={64} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <p className="text-white font-bold text-xl">EliteInterviewer AI</p>
                    <p className="text-indigo-400 text-sm animate-pulse">{isModelSpeaking ? 'Interviewer is speaking...' : 'Listening...'}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-8 text-center gap-4 z-20">
                  <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
                    <X size={24} className="text-white" />
                  </div>
                  <p className="text-red-200 font-medium">{error}</p>
                  <div className="flex gap-2">
                    <Button onClick={startSession} variant="outline" className="border-red-500 text-red-100">
                      Try Again
                    </Button>
                    <Button onClick={onClose} variant="ghost">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isConnecting && !error && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-4 z-20">
                  <Loader2 size={40} className="animate-spin text-indigo-500" />
                  <p className="text-gray-300 font-medium">Connecting to AI Interviewer...</p>
                </div>
              )}

              {!isSessionActive && !error && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-6 z-20 p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2 mx-auto">
                    {mode === 'video' ? <VideoIcon size={40} className="text-indigo-400" /> : <Mic size={40} className="text-indigo-400" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Ready for your interview?</h3>
                    <p className="text-gray-400 max-w-xs mx-auto text-sm">Click below to start the high-stakes session for your {role} preparation.</p>
                  </div>
                  <Button 
                    onClick={startSession}
                    size="lg"
                    className="h-12 px-10 rounded-full text-base"
                  >
                    Start Interview
                  </Button>
                </div>
              )}
            </div>

            <div className="w-full md:w-80 bg-gray-900/50 border-t md:border-t-0 md:border-l border-gray-800 p-4 flex flex-col gap-4 overflow-hidden h-[30vh] md:h-auto">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} />
                  Live Transcript
               </h4>
                <div className="flex-1 overflow-auto space-y-3 custom-scrollbar pr-2">
                   {transcript.length === 0 ? (
                     <div className="text-gray-600 italic text-xs py-4">Waiting for conversation...</div>
                   ) : (
                     transcript.slice(-15).map((t, i) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         key={i} 
                         className={`text-xs p-3 rounded-xl border ${
                           t.role === 'user' 
                             ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100' 
                             : 'bg-gray-800/50 border-gray-700/50 text-gray-300'
                         }`}
                       >
                         <p className="text-[8px] font-bold uppercase opacity-40 mb-1">{t.role === 'user' ? 'You' : 'EliteInterviewer'}</p>
                         {t.chunk}
                       </motion.div>
                     ))
                   )}
                </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-gray-800 bg-gray-900 flex items-center justify-center gap-4 md:gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <Button 
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                variant="outline" 
                size="icon"
                className={`h-12 w-12 md:h-14 md:w-14 rounded-full border-2 ${
                  isMicEnabled 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-red-500/20 border-red-500 text-red-500'
                }`}
              >
                {isMicEnabled ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
              </Button>
              <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase">{isMicEnabled ? 'Unmuted' : 'Muted'}</span>
            </div>

            {mode === 'video' && (
              <div className="flex flex-col items-center gap-1.5">
                <Button 
                  onClick={() => setIsCamEnabled(!isCamEnabled)}
                  variant="outline" 
                  size="icon"
                  className={`h-12 w-12 md:h-14 md:w-14 rounded-full border-2 ${
                    isCamEnabled 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-red-500/20 border-red-500 text-red-500'
                  }`}
                >
                  {isCamEnabled ? <VideoIcon size={20} className="md:w-6 md:h-6" /> : <VideoOff size={20} className="md:w-6 md:h-6" />}
                </Button>
                <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase">{isCamEnabled ? 'Video On' : 'Video Off'}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1.5">
              <Button 
                onClick={handleEndSession}
                disabled={isAnalyzing}
                className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20 disabled:scale-95 transition-transform"
              >
                {isAnalyzing ? <Loader2 size={28} className="animate-spin md:w-8 md:h-8" /> : <StopCircle size={28} className="md:w-8 md:h-8" />}
              </Button>
              <span className="text-[8px] md:text-[9px] text-red-500 font-black uppercase">{isAnalyzing ? 'Analyzing...' : 'End session'}</span>
            </div>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-white z-[60] p-6 lg:p-10"
              >
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" className="rounded-full text-indigo-600 border-indigo-100" onClick={onClose}>
                      <X size={18} className="mr-1" /> Close Report
                    </Button>
                  </div>
                  <FeedbackReport feedback={feedback} onClose={onClose} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
