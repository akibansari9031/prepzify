import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LiveInterviewOverlay from './LiveInterviewOverlay';
import { 
  Mic, 
  Video, 
  VideoOff, 
  MicOff, 
  MessageSquare, 
  X, 
  Zap,
  LayoutGrid,
  Info,
  Terminal,
  History,
  Send,
  Timer
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'ai' | 'user';
  content: string;
  feedback?: {
    strengths: string[];
    improvements: string[];
  };
}

type Mode = 'chat' | 'video' | 'audio';

export default function InterviewAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [mode, setMode] = useState<Mode>('video');
  const [isStarted, setIsStarted] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Software Development Engineer');
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [showTranscript, setShowTranscript] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const startInterview = async () => {
    setIsStarted(true);
    if (mode === 'chat') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        chatSessionRef.current = ai.chats.create({ 
          model: "gemini-2.0-flash",
          config: {
            systemInstruction: `You are "EliteInterviewer AI," a senior technical recruiter for BTech placements. 
            Conduct a high-stakes mock interview for the ${selectedRole} role.
            Guidelines:
            - ONE QUESTION AT A TIME.
            - Multi-stage: Intro -> Technical (CS fund, DSA) -> HR.
            - Start by introducing yourself and asking for their name and branch.
            - Respond to their answers with brief validation before the next question.
            - If the student's answer is too short, probe deeper. If they are stuck, give a small hint to keep the conversation moving.`
          }
        });
        const result = await chatSessionRef.current.sendMessage({ message: "Hello! Let's start the interview." });
        const text = result.text;
        setMessages([{ role: 'ai', content: text }]);
        setCurrentQuestion(text);
      } catch (err) {
        console.error("Chat Error:", err);
        setErrorStatus("Failed to start chat session.");
      }
    }
  };

  const endSession = () => {
    setIsStarted(false);
    setMessages([]);
    setCurrentQuestion('');
    setTimeLeft(1800);
    chatSessionRef.current = null;
  };

  const handleSendText = async () => {
    if (!userInput.trim() || !chatSessionRef.current || isTyping) return;
    
    const userText = userInput;
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userText });
      const aiText = result.text;
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
      setCurrentQuestion(aiText);
    } catch (err) {
      console.error("Chat error:", err);
      setErrorStatus("Failed to get response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: any;
    if (isStarted) interval = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [isStarted]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div 
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[calc(100vh-64px)] overflow-y-auto bg-background items-center justify-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full space-y-8 md:space-y-12 py-10"
            >
              <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Pre-Interview Briefing</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black text-on-surface">Configure Your Session</h2>
                 <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                   Set up your environment and select your target role to begin the deep-dive technical assessment.
                 </p>
              </div>

              <div className="grid gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Target Position</label>
                   <input 
                     type="text" 
                     value={selectedRole}
                     onChange={(e) => setSelectedRole(e.target.value)}
                     className="w-full bg-surface-container border border-outline rounded-2xl p-4 text-on-surface font-medium focus:border-primary/40 transition-colors outline-none shadow-sm"
                     placeholder="e.g. Senior Frontend Engineer"
                   />
                </div>

                 <div className="space-y-4">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Interview Format</label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                     {[
                       { id: 'video', label: 'Video Test', icon: Video, desc: 'Live cam & voice' },
                       { id: 'audio', label: 'Audio Test', icon: Mic, desc: 'Voice communication' },
                       { id: 'chat', label: 'Text Test', icon: MessageSquare, desc: 'Written dialogue' },
                     ].map((t) => (
                       <button
                         key={t.id}
                         onClick={() => setMode(t.id as Mode)}
                         className={`flex flex-row sm:flex-col items-center sm:items-start gap-4 p-4 md:p-5 rounded-2xl border transition-all text-left ${
                           mode === t.id 
                             ? 'border-primary bg-primary/5 text-primary shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                             : 'border-outline bg-surface-container text-on-surface-variant hover:border-outline-variant'
                         }`}
                       >
                         <t.icon className={`w-5 h-5 shrink-0 ${mode === t.id ? 'text-primary' : ''}`} />
                         <div>
                           <p className={`text-xs font-bold leading-none mb-1 ${mode === t.id ? 'text-on-surface' : ''}`}>{t.label}</p>
                           <p className="text-[10px] opacity-60 font-medium">{t.desc}</p>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>

                <div className="bg-surface-container border border-outline rounded-2xl p-6 flex items-center justify-center">
                  <button 
                    onClick={startInterview}
                    className="w-full sm:w-auto px-16 py-4 bg-primary text-on-primary font-black uppercase text-[11px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Begin Assessment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          mode !== 'chat' ? (
            <LiveInterviewOverlay key="live-overlay" mode={mode} role={selectedRole} onClose={endSession} />
          ) : (
            <motion.div 
              key="chat-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background"
            >
              <main className="flex-1 relative flex flex-col items-center p-3 md:p-6 gap-3 md:gap-6">
                <div className="w-full max-w-5xl flex justify-between items-center z-10 px-2 md:px-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-surface-container border border-outline px-3 md:px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-xl">
                      <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
                      <span className="text-[9px] md:text-[10px] font-bold text-on-surface uppercase tracking-widest truncate max-w-[100px] md:max-w-none">Chat Assessment</span>
                      <span className="w-px h-3 bg-outline" />
                      <span className="text-[10px] font-mono text-on-surface-variant">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={endSession}
                    className="bg-error/10 hover:bg-error/20 text-error px-3 md:px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-error/20 transition-all flex items-center gap-2"
                  >
                    <X className="w-3 h-3" /> <span className="hidden sm:inline">End Session</span>
                  </button>
                </div>

                <div className="flex-1 w-full max-w-4xl bg-surface-container rounded-3xl border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-black text-xs shadow-lg">AI</div>
                      <div>
                         <h4 className="text-sm font-bold text-white leading-none">EliteInterviewer AI</h4>
                         <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Active Chat session</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`h-8 w-8 rounded-full border border-outline shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === 'ai' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}>
                            {msg.role === 'ai' ? 'IA' : 'ME'}
                         </div>
                        <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed font-medium ${msg.role === 'ai' ? 'bg-surface-container-high text-on-surface shadow-lg border border-outline' : 'bg-primary text-on-primary shadow-[0_4px_12px_rgba(99,102,241,0.2)] border border-primary'}`}>
                           {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-4">
                         <div className="h-8 w-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">IA</div>
                         <div className="p-5 rounded-2xl bg-surface-container-high border border-outline flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                         </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  {errorStatus && (
                    <div className="mx-8 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center flex items-center justify-center gap-2">
                       <Info className="w-3 h-3" />
                       {errorStatus}
                    </div>
                  )}

                  <div className="p-6 border-t border-white/5 flex gap-3">
                    <textarea 
                       value={userInput}
                       onChange={(e) => setUserInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendText())}
                       placeholder="Type your detailed response..."
                       className="flex-1 bg-surface-container-high border border-outline rounded-2xl p-4 text-sm resize-none outline-none focus:border-primary/40 transition-colors h-14"
                    />
                    <button 
                      onClick={handleSendText}
                      disabled={!userInput.trim() || isTyping}
                      className="bg-primary text-on-primary h-14 w-14 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </main>

              <aside className="hidden lg:flex w-80 bg-surface border-l border-outline p-8 flex-col gap-6">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <History className="w-3 h-3" /> Assessment Log
                </h4>
                <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
                   {messages.map((m, i) => (
                     <div key={i} className="space-y-1">
                        <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${m.role === 'ai' ? 'text-primary' : 'text-secondary'}`}>{m.role}</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{m.content}</p>
                     </div>
                   ))}
                </div>
                <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
                   <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Live Strategy</p>
                   <p className="text-xs text-on-surface-variant italic leading-relaxed">
                     "Maintain a professional tone and provide technical specifics whenever possible to score higher."
                   </p>
                </div>
              </aside>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </>
  );
}
