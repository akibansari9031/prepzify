import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  type: 'aptitude' | 'coding';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'aptitude',
    question: "A train 120m long passes a pole in 6 seconds. What is the speed of the train in km/hr?",
    options: ["60 km/hr", "72 km/hr", "80 km/hr", "90 km/hr"],
    correctAnswer: 1,
    explanation: "Speed = Distance / Time = 120 / 6 = 20 m/s. To convert to km/hr, multiply by 18/5: 20 * (18/5) = 72 km/hr."
  },
  {
    id: 2,
    type: 'coding',
    question: "Which data structure is best suited for implementing a FIFO (First-In, First-Out) behavior?",
    options: ["Stack", "Array", "Queue", "Binary Tree"],
    correctAnswer: 2,
    explanation: "A Queue follows the FIFO principle, where the first element added is the first one to be removed."
  },
  {
    id: 3,
    type: 'aptitude',
    question: "The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?",
    options: ["24", "26", "28", "30"],
    correctAnswer: 2,
    explanation: "Sum of 5 numbers = 5 * 20 = 100. Sum of 4 numbers = 4 * 18 = 72. Excluded number = 100 - 72 = 28."
  },
  {
    id: 4,
    type: 'coding',
    question: "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctAnswer: 2,
    explanation: "In a balanced BST, each comparison halves the search space, leading to a logarithmic time complexity."
  },
  {
    id: 5,
    type: 'aptitude',
    question: "If 15% of a number is 45, what is 40% of that number?",
    options: ["100", "120", "150", "180"],
    correctAnswer: 1,
    explanation: "Let the number be x. 0.15x = 45 => x = 45 / 0.15 = 300. 40% of 300 = 0.40 * 300 = 120."
  },
  {
    id: 6,
    type: 'coding',
    question: "What does HTML stand for?",
    options: ["Hyper Transfer Markup Language", "Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink Text Management Logic"],
    correctAnswer: 1,
    explanation: "HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages."
  },
  {
    id: 7,
    type: 'aptitude',
    question: "A shopkeeper sells an item for $240 at a profit of 20%. What was the cost price of the item?",
    options: ["$180", "$200", "$210", "$220"],
    correctAnswer: 1,
    explanation: "Selling Price (SP) = CP * (1 + Profit%). 240 = CP * 1.2 => CP = 240 / 1.2 = 200."
  },
  {
    id: 8,
    type: 'coding',
    question: "Which of the following is NOT a JavaScript framework/library?",
    options: ["React", "Angular", "Django", "Vue"],
    correctAnswer: 2,
    explanation: "Django is a high-level Python web framework, whereas React, Angular, and Vue are JavaScript-based."
  },
  {
    id: 9,
    type: 'aptitude',
    question: "Complete the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correctAnswer: 1,
    explanation: "The differences are consecutive even numbers: 4, 6, 8, 10. The next difference is 12. 30 + 12 = 42."
  },
  {
    id: 10,
    type: 'coding',
    question: "In CSS, which property is used to change the background color?",
    options: ["color", "bgcolor", "background-color", "canvas-color"],
    correctAnswer: 2,
    explanation: "The 'background-color' property in CSS is used to set the background color of an element."
  }
];

export default function QuickPrepAssessment({ isModal = false, onClose }: { isModal?: boolean, onClose?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUESTIONS.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (optionIndex: number) => {
    if (answers[currentStep] !== null) return;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = answers.reduce((acc, ans, idx) => {
    return ans === QUESTIONS[idx].correctAnswer ? acc + 1 : acc;
  }, 0);

  const reset = () => {
    setCurrentStep(0);
    setAnswers(new Array(QUESTIONS.length).fill(null));
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-surface ${isModal ? 'max-w-lg mx-auto' : 'min-h-screen'}`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Assessment Complete!</h2>
          <p className="text-on-surface-variant text-sm mb-6">You've finished the quick technical and aptitude check.</p>
          
          <div className="bg-surface-container p-4 rounded-xl border border-outline-variant mb-6 w-full">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Final Score</p>
            <div className="text-4xl font-black text-primary mb-1">
              {score} / {QUESTIONS.length}
            </div>
            <div className="text-xs font-medium text-on-surface">
              {Math.round((score / QUESTIONS.length) * 100)}% Accuracy
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={reset}
              className="flex-1 bg-surface-container-high border border-outline-variant py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
            <button 
              onClick={onClose || (() => navigate('/'))}
              className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <Home className="w-3.5 h-3.5" /> Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = QUESTIONS[currentStep];
  const isCorrect = answers[currentStep] === q.correctAnswer;
  const isWrong = answers[currentStep] !== null && !isCorrect;

  return (
    <div className={`bg-surface ${isModal ? 'p-6 rounded-2xl w-full max-w-lg' : 'min-h-screen p-6'}`}>
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1 inline-block">
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
            <h1 className="text-lg font-bold capitalize">{q.type} Assessment</h1>
          </div>
          {isModal && (
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1.5 bg-surface-container rounded-full">
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-surface-container rounded-full mb-6 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h2 className="text-base md:text-lg font-medium leading-relaxed">
                {q.question}
              </h2>

              <div className="space-y-2">
                {q.options.map((option, idx) => {
                  const isSelected = answers[currentStep] === idx;
                  const isAnswerCorrect = q.correctAnswer === idx;
                  
                  let bgColor = 'bg-surface-container hover:bg-surface-container-high transition-colors';
                  let borderColor = 'border-outline-variant';
                  
                  if (isSelected) {
                    if (isAnswerCorrect) {
                      bgColor = 'bg-emerald-500/10 border-emerald-500';
                      borderColor = 'border-emerald-500';
                    } else {
                      bgColor = 'bg-red-500/10 border-red-500';
                      borderColor = 'border-red-500';
                    }
                  } else if (answers[currentStep] !== null && isAnswerCorrect) {
                     borderColor = 'border-emerald-500 border-2';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={answers[currentStep] !== null}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 ${bgColor} ${borderColor} flex items-center justify-between transition-all group`}
                    >
                      <span className={`text-xs font-medium ${isSelected ? 'font-bold' : ''}`}>{option}</span>
                      {isSelected && (isAnswerCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />)}
                    </button>
                  );
                })}
              </div>

              {answers[currentStep] !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg ${isCorrect ? 'bg-emerald-500/5' : 'bg-amber-500/5'} border border-outline-variant mt-4`}
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Explanation</p>
                  <p className="text-xs text-on-surface-variant">{q.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            disabled={answers[currentStep] === null}
            onClick={nextQuestion}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all ${
              answers[currentStep] === null 
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-50' 
                : 'bg-primary text-on-primary hover:brightness-110'
            }`}
          >
            {currentStep === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
