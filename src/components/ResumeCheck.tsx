import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeResume, extractTextFromImage } from '../services/geminiService';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  ChevronRight,
  Loader2,
  Trash2,
  Sparkles,
  Search
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

// pdfjs worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface AnalysisResult {
  score: number;
  keyStrengths: string[];
  areasForImprovement: string[];
  atsCompatibility: string;
  summary: string;
  recommendations: string[];
}

export default function ResumeCheck() {
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [feedback, setFeedback] = useState<AnalysisResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsExtracting(true);
    let text = '';
    
    try {
      if (uploadedFile.type === 'application/pdf') {
        text = await extractTextFromPDF(uploadedFile);
      } else if (uploadedFile.type.startsWith('image/')) {
        text = await extractTextFromImage(uploadedFile);
      } else {
        alert("Unsupported file type. Please upload a PDF or an Image.");
        setFile(null);
        setIsExtracting(false);
        return;
      }

      setResumeText(text);
      
      // Auto-analyze if job context is already provided
      if (jobTitle.trim() && text.trim()) {
        await handleAnalyze(text);
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert("Failed to extract text from file. Please try a different file.");
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async (textToUse?: string) => {
    const text = textToUse || resumeText;
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const responseText = await analyzeResume(text, jobTitle, jobDescription);
      const result = JSON.parse(responseText.trim());
      setFeedback(result);
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Resume Intelligence</h2>
          <p className="text-on-surface-variant max-w-md text-sm md:text-base">Tailor your profile for Elite engineering roles with deep semantic analysis.</p>
        </div>
        <div className="flex gap-2">
           <span className="bg-primary/10 text-primary text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full border border-primary/20 uppercase">Intelligence v4.2</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {!feedback ? (
          <div className="lg:col-span-12 flex flex-col items-center">
            <div className="w-full max-w-3xl space-y-8 lg:space-y-12">
              {/* Step 1: Context */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 1: Provide Context</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Desired Job Title (e.g. Senior Backend Engineer)"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Company Category (e.g. Fintech, FAANG)"
                        className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-4 text-sm focus:border-primary outline-none transition-all"
                      />
                    </div>
                 </div>
                 <textarea 
                   placeholder="Job Description (Optional but recommended for deeper tailoring...)"
                   value={jobDescription}
                   onChange={(e) => setJobDescription(e.target.value)}
                   className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-4 text-sm focus:border-primary outline-none transition-all h-24 resize-none"
                 />
              </div>

              {/* Step 2: Resume */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 2: Upload or Paste Resume</span>
                    {file && (
                       <button onClick={() => {setFile(null); setResumeText('');}} className="text-error/60 hover:text-error flex items-center gap-1 text-[10px] font-bold uppercase">
                          <Trash2 className="w-3 h-3" /> Clear
                       </button>
                    )}
                 </div>
                 
                 {!file ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group bg-surface-container/50 border-2 border-dashed border-outline-variant/50 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <div className="p-4 bg-surface-container-high rounded-full group-hover:scale-110 transition-transform">
                         <Upload className="w-8 h-8 text-on-surface-variant group-hover:text-primary" />
                      </div>
                      <div className="text-center space-y-1">
                         <p className="font-bold text-on-surface">Click to upload PDF or Image</p>
                         <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">or drag and drop here</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        hidden 
                        accept=".pdf,image/*"
                      />
                    </div>
                 ) : (
                    <div className="bg-surface-container-high border border-primary/20 rounded-2xl p-6 flex flex-col gap-4">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                             <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-bold text-on-surface truncate">{file.name}</p>
                             <p className="text-[10px] text-on-surface-variant uppercase font-mono">
                                {(file.size / 1024).toFixed(1)} KB • {isExtracting ? 'Extracting Intelligence...' : 'Ready'}
                             </p>
                          </div>
                          {isExtracting ? (
                             <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          ) : (
                             <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                       </div>
                       {(isAnalyzing || isExtracting) && (
                         <div className="flex items-center gap-2 px-2">
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                               {isExtracting ? 'Processing Document...' : 'AI analysis in progress...'}
                            </span>
                         </div>
                       )}
                    </div>
                 )}

                 {!file && (
                   <div className="relative">
                      <div className="absolute top-4 left-4 text-[10px] font-bold uppercase text-on-surface-variant/30">Manual Text Mode</div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="...Alternatively, paste your raw resume text here"
                        className="w-full h-80 bg-surface-container/30 border border-outline-variant/30 rounded-3xl p-10 pt-14 text-sm font-mono leading-relaxed outline-none focus:border-primary/40 transition-all resize-none"
                      />
                   </div>
                 )}

                 <button 
                   onClick={() => handleAnalyze()}
                   disabled={isAnalyzing || isExtracting || !resumeText.trim()}
                   className="w-full py-6 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   {isAnalyzing ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Processing Intelligence...
                     </>
                   ) : (
                     <>
                       <Sparkles className="w-5 h-5" />
                       Generate Technical Audit
                     </>
                   )}
                 </button>
              </div>

              {/* Status/Awaiting Area (Below Button) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-outline-variant/30 rounded-[40px] flex flex-col items-center justify-center p-12 text-center"
              >
                 <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-on-surface-variant/20" />
                 </div>
                 <h3 className="font-bold text-on-surface text-lg mb-2">Awaiting Intelligence</h3>
                 <p className="text-xs text-on-surface-variant opacity-60">Complete the steps above to see your customized technical audit.</p>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Post-Audit Focused Layout */
          <div className="lg:col-span-12 space-y-8 lg:space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Main Analysis Details */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden">
                  <div className="bg-surface-container-high px-8 py-4 border-b border-outline-variant/30 flex items-center justify-between">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Technical Audit Report</span>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase">Analysis Finalized</span>
                     </div>
                  </div>
                  
                  <div className="p-4 md:p-8 space-y-8 md:space-y-12">
                    <section className="space-y-4 md:space-y-6">
                       <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#000000] bg-emerald-400/5 py-2 px-4 rounded-full w-fit">
                          <CheckCircle2 className="w-4 h-4" /> Strong Technical Signals
                       </h4>
                       <div className="flex flex-wrap gap-3">
                          {feedback.keyStrengths.map((s, i) => (
                            <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-[#0052d4] font-bold">{s}</span>
                          ))}
                       </div>
                    </section>

                    <section className="space-y-6">
                       <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#ff0b10] bg-red-400/5 py-2 px-4 rounded-full w-fit">
                          <AlertCircle className="w-4 h-4" /> Critical Narrative Gaps
                       </h4>
                       <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {feedback.areasForImprovement.map((s, i) => (
                            <li key={i} className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 flex gap-3 text-xs text-[#000000] leading-relaxed">
                               <span className="text-red-400 font-black">!</span> {s}
                            </li>
                          ))}
                       </ul>
                    </section>

                    <section className="space-y-6">
                       <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-tertiary bg-tertiary/5 py-2 px-4 rounded-full w-fit">
                          <Target className="w-4 h-4" /> Strategic Tailoring Playbook
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {feedback.recommendations.map((r, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-surface-container-high rounded-2xl group cursor-pointer hover:border-tertiary/30 border border-transparent transition-all">
                               <span className="text-xs text-on-surface font-medium pr-4">{r}</span>
                               <ChevronRight className="w-4 h-4 text-tertiary" />
                            </div>
                          ))}
                       </div>
                    </section>

                    <div className="pt-8 border-t border-outline-variant/30">
                       <div className="flex items-center justify-between text-[10px] font-bold uppercase text-on-surface-variant tracking-widest mb-4">
                          <span>ATS Semantic Compatibility</span>
                       </div>
                       <p className="text-sm leading-relaxed text-on-surface-variant bg-surface-container/50 p-6 rounded-2xl italic">
                         {feedback.atsCompatibility}
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: Score and Actions */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="sticky top-10 space-y-6">
                   {/* Action Buttons */}
                   <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => {
                           setFeedback(null);
                           setFile(null);
                           setResumeText('');
                        }}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-surface-container-highest border border-outline-variant text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-surface-container transition-all"
                      >
                         <Upload className="w-4 h-4" /> Reupload Resume
                      </button>
                      <button 
                         onClick={() => {
                            if (file) {
                               const url = URL.createObjectURL(file);
                               window.open(url, '_blank');
                            }
                         }}
                         className="flex items-center justify-center gap-3 w-full py-4 bg-surface-container-high border border-outline-variant text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-surface-container transition-all"
                      >
                         <FileText className="w-4 h-4" /> View Current Document
                      </button>
                   </div>

                   {/* Match Score Box */}
                   <div className="bg-[#0f0f12] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors" />
                      
                      <div className="flex flex-col items-center text-center relative z-10 space-y-6">
                         <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em]">Technical Match Score</span>
                         
                         <div className="relative flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                               <circle
                                 cx="64"
                                 cy="64"
                                 r="60"
                                 stroke="currentColor"
                                 strokeWidth="4"
                                 fill="transparent"
                                 className="text-white/5"
                               />
                               <motion.circle
                                 cx="64"
                                 cy="64"
                                 r="60"
                                 stroke="currentColor"
                                 strokeWidth="4"
                                 fill="transparent"
                                 strokeDasharray={377}
                                 initial={{ strokeDashoffset: 377 }}
                                 animate={{ strokeDashoffset: 377 - (377 * feedback.score) / 100 }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className="text-primary"
                               />
                            </svg>
                            <span className="absolute text-5xl font-black text-white">{feedback.score}<span className="text-primary text-xl">%</span></span>
                         </div>
                         
                         <p className="text-[11px] text-white leading-relaxed opacity-70 px-4">
                           {feedback.summary}
                         </p>
                      </div>
                   </div>

                   {/* Job Context Chip */}
                   <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/30">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-3">Audit target</span>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Target className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-on-surface truncate">{jobTitle || 'General Engineering'}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase font-mono tracking-tighter">FAANG Standard Analysis</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
