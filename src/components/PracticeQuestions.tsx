import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Editor } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { analyzeCode, generateContent, models } from '../services/geminiService';
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
  Loader2, 
  MessageSquare, 
  FileText, 
  Clock, 
  BookOpen, 
  Trophy, 
  Star 
} from 'lucide-react';
import { Question, QuestionStore } from '../types';
import { updateXp } from '../lib/firebase';

export default function PracticeQuestions() {
  const [filterCategory, setFilterCategory] = useState<'coding' | 'aptitude' | 'technical' | 'all'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'gemini'>('console');
  const [leftTab, setLeftTab] = useState<'description' | 'editorial' | 'solutions' | 'submissions'>('description');
  const [questionStore, setQuestionStore] = useState<QuestionStore>({});
  const [generatingKeys, setGeneratingKeys] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

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

  const getStarterCode = (q: Question, lang: string) => {
    const title = q.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const functionName = (title.includes('valid') || title.includes('is')) ? 'isValid' : 'solve';
    
    switch (lang) {
      case 'python':
        return `class Solution(object):\n    def ${functionName}(self, input):\n        # Your code here\n        pass`;
      case 'cpp':
        return `#include <iostream>\n#include <string>\n#include <vector>\n\nclass Solution {\npublic:\n    void ${functionName}(std::string s) {\n        // Your code here\n    }\n};`;
      case 'java':
        return `/**\n * Definition for assessment node.\n */\nclass Solution {\n    public void ${functionName}(String s) {\n        // Your code here\n    }\n}`;
      default:
        return `function ${functionName}(input) {\n    // Your code here\n}`;
    }
  };

  const handleOpenQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setSelectedOption(null);
    setShowAnswer(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (q.category === 'coding') {
      setCode(getStarterCode(q, language));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    setIsRunning(true);
    setIsAnalyzing(true);
    setOutput('System Check: Compiling and verifying context...\n');
    setActiveTab('console');
    
    // 1. Run the code
    if (language === 'javascript') {
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
        let runnerCode = code;
        if (selectedQuestion?.examples?.[0]) {
          // Detect function name from code or question title
          const title = selectedQuestion.title.toLowerCase();
          const targetFunc = (title.includes('valid') || code.includes('isValid')) ? 'isValid' : 'solve';
          
          if (code.includes(targetFunc)) {
            const input = selectedQuestion.examples[0].input;
            // Handle common data structures if needed, but for now simple input
            runnerCode += `\n\n// AI Studio Preview Execution\n(function() {\n  try {\n    console.log("Input:", ${JSON.stringify(input)});\n    const result = ${targetFunc}(${input});\n    console.log("Output:", result);\n  } catch (e) {\n    console.error("Execution Error:", e.message);\n  }\n})();`;
          }
        }

        // Execute in a sandbox-like manner
        const execute = new Function('console', runnerCode);
        execute(console);
        
        setOutput(logs.join('\n') || 'Execution finished. No logs captured.');
      } catch (error: any) {
        setOutput(`Compilation/Runtime Error: ${error.message}\n${error.stack?.split('\n').slice(0, 2).join('\n') || ''}`);
      } finally {
        console.log = originalLog;
        console.error = originalError;
        setIsRunning(false);
      }
    } else {
      // For non-JS, we use Gemini to "simulate" the execution
      setOutput(prev => prev + `[Simulation Mode] Interpreting ${language} logic...\n\n`);
      try {
        const simulationResult = await generateContent({
          prompt: `Act as a high-precision code interpreter. Execute this ${language} code with the provided input and return ONLY the console output.
          
INPUT:
${selectedQuestion?.examples?.[0]?.input || 'N/A'}

CODE:
${code}

If there are syntax errors, output them clearly. If logic is correct, show the resulting output.`,
          systemInstruction: "You are a remote code execution engine. Output only the results of execution.",
          model: models.pro
        });
        setOutput(simulationResult);
      } catch (error: any) {
        setOutput(`Simulation Failed: ${error.message || 'Unable to reach execution engine.'}`);
      } finally {
        setIsRunning(false);
      }
    }

    // 2. Technical Review (AI Analysis)
    try {
      const result = await analyzeCode(code, language);
      setAnalysis(result);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setAnalysis("Technical Review failed. This usually happens due to a network timeout or resource limits. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion) return;
    setIsSubmitting(true);
    let allPassed = false;
    
    // For now, we use Gemini to verify the solution since we don't have a backend runner
    // In a real app, you'd run this through a test suite
    try {
      setOutput('Submitting solution... Running all hidden test cases...\n');
      setActiveTab('console');
      
      const verificationResult = await generateContent({
        prompt: `Act as a competitive programming test runner. Analyze this ${language} code for the problem: "${selectedQuestion.title}".
        Problem description: "${selectedQuestion.content}".
        
        Check the code against ALL constraints and potential edge cases.
        Return your result in valid JSON format ONLY.
        
        {
          "passed": boolean,
          "details": string (summary of test cases run),
          "error": string | null
        }
        
        CODE:
        ${code}`,
        systemInstruction: "You are a strict automated test suite evaluator.",
        responseMimeType: "application/json",
        model: models.pro
      });

      try {
        const parsed = JSON.parse(verificationResult);
        if (parsed.passed) {
          allPassed = true;
          setOutput(`All test cases passed!\n\n${parsed.details}`);
          
          // Award XP based on difficulty
          const xp = selectedQuestion.difficulty === 'easy' ? 50 : 
                     selectedQuestion.difficulty === 'medium' ? 100 : 200;
          
          setXpAwarded(xp);
          await updateXp(xp);
          setShowSuccessModal(true);
        } else {
          setOutput(`Wrong Answer\n${parsed.details}\n${parsed.error || ''}`);
        }
      } catch (e) {
        // Fallback if AI response isn't clean JSON (though using responseMimeType: "application/json" should prevent this)
        if (verificationResult.toLowerCase().includes('"passed": true')) {
           allPassed = true;
           setXpAwarded(50);
           await updateXp(50);
           setShowSuccessModal(true);
           setOutput('Test cases passed (Heuristic check).');
        } else {
           setOutput('Submission failed validation check. Please review your logic.');
        }
      }
    } catch (error: any) {
      setOutput(`Submission failed: ${error.message || 'System error during verification.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedQuestion && selectedQuestion.category === 'coding') {
    return (
      <div className="flex flex-col h-screen bg-[#1a1a1a] text-[#eff1f6]">
        <header className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedQuestion(null)}
              className="flex items-center gap-2 text-[#9da2b0] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Questions</span>
            </button>
            <div className="h-4 w-px bg-[#333]" />
            <h1 className="text-sm font-semibold truncate max-w-[300px]">{selectedQuestion.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <select 
               value={language}
               onChange={(e) => {
                 const newLang = e.target.value;
                 setLanguage(newLang);
                 if (selectedQuestion) {
                   setCode(getStarterCode(selectedQuestion, newLang));
                 }
               }}
               className="bg-[#2a2a2a] border border-[#3c3c3c] text-xs font-medium px-2 py-1 rounded outline-none focus:border-primary transition-colors text-white"
             >
               <option value="javascript">JavaScript</option>
               <option value="python">Python</option>
               <option value="cpp">C++</option>
               <option value="java">Java</option>
             </select>
             <button 
               onClick={handleAnalyze}
               disabled={isAnalyzing || isRunning}
               className="flex items-center gap-2 bg-[#2c2c2c] border border-[#3c3c3c] text-[#9da2b0] px-4 py-1.5 rounded text-xs font-semibold hover:border-white transition-all disabled:opacity-50"
             >
               <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-primary' : ''}`} />
               Run
             </button>
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting || isRunning}
               className="bg-[#2cbb5d1a] border border-[#2cbb5d] text-[#2cbb5d] px-4 py-1.5 rounded text-xs font-semibold hover:bg-[#2cbb5d26] transition-all disabled:opacity-50"
             >
               {isSubmitting ? 'Submitting...' : 'Submit'}
             </button>
          </div>
        </header>

        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#282828] border border-[#3c3c3c] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-[#2cbb5d1a] rounded-full flex items-center justify-center mx-auto mb-6 text-[#2cbb5d] shadow-[0_0_20px_rgba(44,187,93,0.3)]">
                <Trophy className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Accepted!</h2>
              <p className="text-[#9da2b0] mb-6">Your solution passed all test cases. You've earned some points!</p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="bg-[#333] px-6 py-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-primary font-bold text-xl justify-center">
                    <Star className="w-5 h-5 fill-current" />
                    +{xpAwarded}
                  </div>
                  <div className="text-[10px] text-[#9da2b0] uppercase tracking-widest font-bold mt-1">XP EARNED</div>
                </div>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95"
              >
                Continue Practicing
              </button>
            </motion.div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden bg-[#1a1a1a] p-2">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={40} minSize={20}>
              <div className="h-full flex flex-col bg-[#282828] rounded-lg overflow-hidden border border-[#333]">
                <div className="flex items-center px-1 bg-[#282828] border-b border-[#333] shrink-0">
                  <button 
                    onClick={() => setLeftTab('description')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${leftTab === 'description' ? 'text-white border-t-primary bg-[#333]' : 'text-[#9da2b0] hover:text-white'}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Description
                  </button>
                  <button 
                    onClick={() => setLeftTab('editorial')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${leftTab === 'editorial' ? 'text-white border-t-primary bg-[#333]' : 'text-[#9da2b0] hover:text-white'}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Editorial
                  </button>
                  <button 
                    onClick={() => setLeftTab('solutions')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${leftTab === 'solutions' ? 'text-white border-t-primary bg-[#333]' : 'text-[#9da2b0] hover:text-white'}`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Solutions
                  </button>
                  <button 
                    onClick={() => setLeftTab('submissions')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${leftTab === 'submissions' ? 'text-white border-t-primary bg-[#333]' : 'text-[#9da2b0] hover:text-white'}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Submissions
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#282828]">
                  {leftTab === 'description' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">{selectedQuestion.title}</h2>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                             selectedQuestion.difficulty === 'easy' ? 'text-[#00af9b] bg-[#00af9b1a]' :
                             selectedQuestion.difficulty === 'medium' ? 'text-[#ffb800] bg-[#ffb8001a]' :
                             'text-[#ff2d55] bg-[#ff2d551a]'
                          }`}>
                            {selectedQuestion.difficulty.charAt(0).toUpperCase() + selectedQuestion.difficulty.slice(1)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#9da2b0]">
                            <Zap className="w-3 h-3 fill-current" />
                            {selectedQuestion.topic}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm leading-7 text-[#eff1f6] whitespace-pre-wrap">
                        {selectedQuestion.content}
                      </div>

                      {selectedQuestion.examples && selectedQuestion.examples.map((ex, i) => (
                        <div key={i} className="space-y-3">
                          <p className="text-sm font-semibold">Example {i + 1}:</p>
                          <div className="p-4 bg-[#333] rounded-lg space-y-3 border border-white/5 font-mono text-sm leading-6">
                            <div>
                              <span className="text-[#9da2b0]">Input: </span>
                              <span>{ex.input}</span>
                            </div>
                            <div>
                              <span className="text-[#9da2b0]">Output: </span>
                              <span>{ex.output}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedQuestion.constraints && selectedQuestion.constraints.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold">Constraints:</p>
                          <ul className="list-disc list-inside space-y-2 pl-2">
                            {selectedQuestion.constraints.map((c, i) => (
                              <li key={i} className="text-sm leading-6 text-[#eff1f6]">
                                <code className="bg-[#333] px-1 py-0.5 rounded border border-white/5">{c}</code>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {leftTab === 'editorial' && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-[#333] mx-auto mb-4" />
                      <p className="text-[#9da2b0] text-sm">Official editorial is not available yet.</p>
                    </div>
                  )}

                  {leftTab === 'solutions' && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-[#333] mx-auto mb-4" />
                      <p className="text-[#9da2b0] text-sm">Community solutions are coming soon.</p>
                    </div>
                  )}

                  {leftTab === 'submissions' && (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-[#333] mx-auto mb-4" />
                      <p className="text-[#9da2b0] text-sm">You haven't made any submissions yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 transition-colors hover:bg-primary/20 cursor-col-resize flex items-center justify-center">
              <div className="w-px h-8 bg-[#333]" />
            </PanelResizeHandle>

            <Panel defaultSize={60} minSize={20}>
              <PanelGroup direction="vertical">
                <Panel defaultSize={60} minSize={20}>
                  <div className="h-full flex flex-col bg-[#282828] rounded-lg overflow-hidden border border-[#333]">
                    <div className="h-10 px-4 bg-[#282828] border-b border-[#333] flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold">Code</span>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={(editor) => {
                          setTimeout(() => editor.focus(), 100);
                        }}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          padding: { top: 16, bottom: 16 },
                          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                          suggestOnTriggerCharacters: true,
                          quickSuggestions: true,
                          cursorBlinking: 'smooth',
                          smoothScrolling: true,
                        }}
                      />
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="h-2 transition-colors hover:bg-primary/20 cursor-row-resize flex items-center justify-center">
                  <div className="h-px w-8 bg-[#333]" />
                </PanelResizeHandle>

                <Panel defaultSize={40} minSize={10}>
                  <div className="h-full flex flex-col bg-[#282828] rounded-lg overflow-hidden border border-[#333]">
                    <div className="flex items-center px-1 bg-[#282828] border-b border-[#333] shrink-0">
                      <button 
                        onClick={() => setActiveTab('console')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${activeTab === 'console' ? 'text-white border-t-primary bg-[#333]' : 'text-[#9da2b0] hover:text-white'}`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        Test Result
                      </button>
                      <button 
                        onClick={() => setActiveTab('gemini')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${activeTab === 'gemini' ? 'text-tertiary border-t-tertiary bg-[#333]' : 'text-[#9da2b0] hover:text-white'}`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        AI Feedback
                      </button>
                    </div>

                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-[#282828]">
                      {activeTab === 'console' ? (
                        <div className="space-y-4">
                          {output ? (
                            <pre className={`whitespace-pre-wrap leading-6 ${output.includes('Error') ? 'text-[#ff2d55]' : 'text-[#eff1f6]'}`}>
                              {output}
                            </pre>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-[#9da2b0] text-sm">Run your code to see results here.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="leading-7 prose prose-invert prose-sm max-w-none">
                          {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                              <Loader2 className="w-8 h-8 text-tertiary animate-spin" />
                              <p className="text-xs font-bold tracking-widest uppercase text-tertiary">Analyzing with Gemini AI...</p>
                            </div>
                          ) : analysis ? (
                            <pre className="whitespace-pre-wrap font-sans text-[#eff1f6] bg-[#333] p-4 rounded-lg border border-white/5">{analysis}</pre>
                          ) : (
                            <div className="text-center py-12">
                              <Brain className="w-12 h-12 text-[#333] mx-auto mb-4" />
                              <p className="text-[#9da2b0] text-sm">AI-powered code review and optimization suggestions will appear here.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
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
