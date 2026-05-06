import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Editor } from '@monaco-editor/react';
import { analyzeCode } from '../services/geminiService';
import { generateAIQuestions } from '../services/aiQuestionService';
import { QUESTIONS, DEPARTMENTS, BRANCHES } from '../data/questions';
import { 
  Code2, 
  BrainCircuit, 
  ChevronRight, 
  Terminal, 
  Brain, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Zap,
  Filter,
  Search,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Question, QuestionStore } from '../types';

export default function PracticeQuestions() {
  const [filterCategory, setFilterCategory] = useState<'coding' | 'aptitude' | 'technical' | 'all'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'gemini'>('console');
  const [questionStore, setQuestionStore] = useState<QuestionStore>({});
  const [generatingKeys, setGeneratingKeys] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredQuestions = useMemo(() => {
    const topics = selectedTopic === 'ALL'
      ? (DEPARTMENTS[selectedBranch]?.topics || [])
      : [selectedTopic];
    
    const results: Question[] = [];

    // Static questions
    QUESTIONS.forEach(q => {
      const matchesBranch = selectedBranch === 'ALL' || q.branch === selectedBranch;
      const matchesTopic = selectedTopic === 'ALL' || q.topic === selectedTopic;
      const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             q.content.toLowerCase().includes(searchQuery.toLowerCase());
      if (matchesBranch && matchesTopic && matchesCategory && matchesSearch) {
        results.push(q);
      }
    });

    // AI questions
    topics.forEach(t => {
      const topicStore = questionStore[selectedBranch]?.[t] || {};
      const cats = filterCategory === 'all'
        ? (['coding', 'aptitude', 'technical'] as const)
        : [filterCategory];
      
      cats.forEach(c => {
         const questionsForCat = (topicStore[c as keyof typeof topicStore] || []) as Question[];
         questionsForCat.forEach((q) => {
            const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   q.content.toLowerCase().includes(searchQuery.toLowerCase());
            if (matchesSearch) {
              results.push(q);
            }
         });
      });
    });

    return results;
  }, [questionStore, selectedBranch, selectedTopic, filterCategory, searchQuery]);

  const dynamicTopics = useMemo(() => {
    return ['ALL', ...(DEPARTMENTS[selectedBranch]?.topics || [])];
  }, [selectedBranch]);

  const handleGenerate = async () => {
    const topics = selectedTopic === 'ALL'
      ? DEPARTMENTS[selectedBranch].topics
      : [selectedTopic];
    
    const cats: ('coding' | 'aptitude' | 'technical')[] =
      filterCategory === 'all' ? ['coding', 'aptitude', 'technical'] : [filterCategory];

    for (const t of topics) {
      for (const c of cats) {
        const key = `${selectedBranch}||${t}||${c}`;
        if (generatingKeys.has(key)) continue;

        setGeneratingKeys(prev => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });

        generateAIQuestions(DEPARTMENTS[selectedBranch].name, t, c, selectedBranch)
          .then(questions => {
            setQuestionStore(prev => {
              const currentBranch = prev[selectedBranch] || {};
              const currentTopic = currentBranch[t] || { coding: [], aptitude: [], technical: [] };
              
              return {
                ...prev,
                [selectedBranch]: {
                  ...currentBranch,
                  [t]: {
                    ...currentTopic,
                    [c]: questions
                  }
                }
              };
            });
          })
          .finally(() => {
            setGeneratingKeys(prev => {
              const next = new Set(prev);
              next.delete(key);
              return next;
            });
          });
      }
    }
  };

  const handleOpenQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setSelectedOption(null);
    setShowAnswer(false);
    if (q.category === 'coding') {
      setCode(q.starterCode || '');
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    setIsRunning(true);
    setIsAnalyzing(true);
    setOutput('Running code and analyzing solution...\n\n');
    setActiveTab('console');
    
    // 1. Run the code
    let logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };
    console.error = (...args) => {
      logs.push('Error: ' + args.map(arg => String(arg)).join(' '));
    };

    try {
      // Evaluate the code
      // We wrap it in a function to isolate it slightly and handle any return value
      const userFunction = new Function(code);
      const result = userFunction();
      if (result !== undefined) {
        logs.push(`Returned: ${typeof result === 'object' ? JSON.stringify(result) : result}`);
      }
      setOutput(prev => prev + (logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no logs).'));
    } catch (error: any) {
      setOutput(prev => prev + `Runtime Error: ${error.message}\n${error.stack || ''}`);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setIsRunning(false);
    }

    // 2. Analyze the code
    try {
      const result = await analyzeCode(code, 'javascript');
      setAnalysis(result);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setAnalysis("Technical Review failed. This usually happens due to a network timeout or resource limits. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (selectedQuestion && selectedQuestion.category === 'coding') {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface-container-lowest">
            <button 
              onClick={() => setSelectedQuestion(null)}
              className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Back to Questions</span>
            </button>
            <div className="flex items-center gap-4">
               <h1 className="text-sm font-bold text-white">{selectedQuestion.title}</h1>
               <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                 selectedQuestion.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                 selectedQuestion.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                 'bg-red-500/10 text-red-400'
               }`}>
                 {selectedQuestion.difficulty}
               </span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing || isRunning}
                 className="flex items-center gap-2 bg-primary text-black px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
               >
                 <Play className={`w-3 h-3 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
                 {isAnalyzing || isRunning ? 'Processing...' : 'Run & Analyze'}
               </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden grid grid-cols-12">
            <div className="col-span-4 border-r border-white/5 bg-surface-container-low/30 p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-10">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      selectedQuestion.difficulty === 'easy' ? 'bg-success/10 text-success' :
                      selectedQuestion.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-error/10 text-error'
                    }`}>
                      {selectedQuestion.difficulty}
                    </span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {selectedQuestion.topic}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-4 tracking-tight">Problem Description</h3>
                  <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedQuestion.content}
                  </div>
                </section>

                {selectedQuestion.constraints && selectedQuestion.constraints.length > 0 && (
                  <section>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 opacity-70">Constraints</h4>
                    <ul className="space-y-3">
                      {selectedQuestion.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                          <code className={`px-3 py-1 rounded-lg border border-white/10 font-mono text-[11px] text-white/90 ${
                            i === 0 ? 'bg-[#080707]' : 
                            i === 1 ? 'bg-[#090808]' : 
                            i === 2 ? 'bg-[#030303]' : 
                            'bg-white/5'
                          }`}>{c}</code>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 opacity-70">Sample Test Cases</h4>
                  <div className="space-y-6">
                    {selectedQuestion.examples?.map((ex, i) => (
                      <div key={i} className="space-y-3">
                        <p className="text-[8px] font-bold text-on-surface-variant/60 uppercase tracking-widest pl-1">Example {i + 1}</p>
                        <div className="p-5 rounded-2xl bg-surface-container/40 border border-white/5 space-y-5">
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary" /> Input
                            </span>
                            <code className="block text-xs text-[#c7d2fe] font-mono bg-[#090909] p-4 rounded-xl border border-primary/30 break-all leading-relaxed">
                              {ex.input}
                            </code>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-tertiary uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-tertiary" /> Output
                            </span>
                            <code className="block text-xs text-[#e9d5ff] font-mono bg-[#030303] p-4 rounded-xl border border-tertiary/30 break-all leading-relaxed">
                              {ex.output}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="col-span-8 flex flex-col min-w-0">
              <div className="flex-1 relative bg-background overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => editor.focus()}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 24, bottom: 24 },
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                  }}
                />
              </div>

              <div className="h-72 border-t border-white/5 bg-surface-container-low/30 flex flex-col">
                <div className="flex border-b border-white/5 px-4 h-10 items-center gap-6">
                  <button 
                    onClick={() => setActiveTab('console')}
                    className={`flex items-center gap-2 px-2 h-full text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'console' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-white'}`}
                  >
                    <Terminal className="w-3 h-3" /> Output
                  </button>
                  <button 
                    onClick={() => setActiveTab('gemini')}
                    className={`flex items-center gap-2 px-2 h-full text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'gemini' ? 'text-tertiary border-b-2 border-tertiary' : 'text-on-surface-variant hover:text-white'}`}
                  >
                    <Brain className="w-3 h-3" /> Gemini Review
                  </button>
                </div>

                <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar">
                  {activeTab === 'console' ? (
                    <pre className={`whitespace-pre-wrap ${output.includes('Error') ? 'text-red-400' : 'text-[#c7d2fe]'}`}>
                      {output || <span className="text-[#000000] opacity-50 italic">Compilation trace will appear here...</span>}
                    </pre>
                  ) : (
                    <div className="max-w-none text-on-surface-variant leading-relaxed">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-3 text-primary animate-pulse">
                          <Zap className="w-4 h-4 animate-bounce" />
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Synthesizing intelligence...</span>
                        </div>
                      ) : analysis ? (
                        <pre className="whitespace-pre-wrap font-sans text-sm">{analysis}</pre>
                      ) : (
                        <span className="opacity-50 italic">Execute code to receive Gemini's optimization metrics.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-4xl font-black text-on-surface tracking-tight">Practice Arena</h2>
            <p className="text-on-surface-variant mt-2 max-w-lg">
              Master world-class engineering challenges across all disciplines.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <button 
              onClick={handleGenerate}
              disabled={generatingKeys.size > 0 || selectedBranch === 'ALL'}
              className="flex items-center gap-2 bg-primary text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {generatingKeys.size > 0 ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generatingKeys.size > 0 ? 'Generating...' : 'AI Generate Questions'}
            </button>

            <div className="flex flex-wrap gap-2 p-1.5 bg-surface-container-high/50 rounded-2xl border border-outline-variant/30">
              {BRANCHES.map((branch) => (
                <button 
                  key={branch}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setSelectedTopic('ALL');
                  }}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedBranch === branch ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Browse by Topics</span>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
              <input 
                type="text"
                placeholder="Search topics or problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-6 text-sm placeholder:text-on-surface-variant/40 focus:border-primary/50 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
             {dynamicTopics.map((topic) => (
               <button
                 key={topic}
                 onClick={() => setSelectedTopic(topic)}
                 className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                   selectedTopic === topic
                     ? 'bg-primary border-primary text-black shadow-lg shadow-primary/10'
                     : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface'
                 }`}
               >
                 {topic}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.length > 0 ? filteredQuestions.slice(0, 50).map((q) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => handleOpenQuestion(q)}
              className="group bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 hover:bg-surface-container-high hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${q.category === 'coding' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {q.category === 'coding' ? <Code2 className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                </div>
                {q.solved && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">{q.title}</h3>
              <div className="flex gap-2 items-center text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                <span className="opacity-60">{q.topic}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant opacity-30"></span>
                <span className={
                  q.difficulty === 'easy' ? 'text-emerald-400' :
                  q.difficulty === 'medium' ? 'text-amber-400' :
                  'text-red-400'
                }>{q.difficulty}</span>
              </div>

              <div className="mt-8 flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-surface-container-low bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary`}>
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="pl-4 text-[9px] font-bold text-on-surface-variant flex items-center">
                      +{Math.floor(Math.random() * 9 + 1)}k solved
                    </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-on-surface-variant opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </div>

              {q.difficulty === 'hard' && !q.solved && (
                 <div className="absolute top-4 right-4 text-[8px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1 opacity-50">
                    <Lock className="w-2.5 h-2.5" />
                    Elite Tier
                 </div>
              )}
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto border border-outline-variant/30">
                <Search className="w-6 h-6 text-on-surface-variant/30" />
              </div>
              <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">No questions found in this category</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {selectedQuestion && (selectedQuestion.category === 'aptitude' || selectedQuestion.category === 'technical') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-surface-container-high w-full max-w-2xl rounded-3xl border border-outline-variant p-10 relative overflow-hidden shadow-2xl"
           >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary" />
             
             <button onClick={() => setSelectedQuestion(null)} className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors">
                <X className="w-6 h-6" />
             </button>

             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{selectedQuestion.category} Assessment</span>
                  <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">
                    <span>{selectedQuestion.branch}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant opacity-30" />
                    <span>{selectedQuestion.topic}</span>
                  </div>
                </div>
             </div>

             <h2 className="text-3xl font-black mb-6 text-white tracking-tight">{selectedQuestion.title}</h2>
             
             <div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/30 mb-8 overflow-y-auto max-h-[50vh] custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <p className="text-on-surface-variant text-base leading-relaxed font-medium whitespace-pre-wrap">{selectedQuestion.content}</p>
                  </div>
                  
                  {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                    <div className="space-y-3">
                      {selectedQuestion.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!showAnswer) setSelectedOption(idx);
                          }}
                          disabled={showAnswer}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                            showAnswer 
                              ? idx === selectedQuestion.correctIndex
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                : idx === selectedOption
                                  ? 'bg-red-500/10 border-red-500 text-red-400'
                                  : 'bg-surface-container border-outline-variant/30 opacity-50'
                              : selectedOption === idx
                                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'bg-surface-container border-outline-variant/30 hover:border-primary/50 text-on-surface'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            showAnswer && idx === selectedQuestion.correctIndex ? 'bg-emerald-500 text-black' : 
                            showAnswer && idx === selectedOption ? 'bg-red-500 text-white' :
                            selectedOption === idx ? 'bg-primary text-black' : 'bg-white/5 text-on-surface-variant'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm font-medium">{option}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {showAnswer && selectedQuestion.explanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
                    >
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Explanation</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{selectedQuestion.explanation}</p>
                    </motion.div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                 {!showAnswer ? (
                   <button 
                     onClick={() => {
                       if (selectedOption !== null) setShowAnswer(true);
                     }}
                     disabled={selectedOption === null}
                     className="flex-1 bg-primary text-black py-4 rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                   >
                     Check Answer
                   </button>
                 ) : (
                   <button 
                     onClick={() => setSelectedQuestion(null)}
                     className="flex-1 bg-surface-container border border-outline-variant/30 text-white py-4 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all"
                   >
                     Move Next
                   </button>
                 )}
                 <button className="px-6 py-4 rounded-xl border border-outline-variant hover:bg-surface-container-highest transition-all">
                    <Brain className="w-5 h-5 text-on-surface-variant" />
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
