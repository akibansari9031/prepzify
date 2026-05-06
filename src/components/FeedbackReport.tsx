import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  Target, 
  Lightbulb,
  Volume2,
  Sparkles
} from 'lucide-react';
import { InterviewFeedback } from '../types';

interface FeedbackReportProps {
  feedback: InterviewFeedback;
  onClose: () => void;
}

// Simple internal components to replace shadcn for this specific report
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-lg font-bold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-2 ${className}`}>{children}</div>
);
const Progress = ({ value, className = "" }: { value: number, className?: string }) => (
  <div className={`w-full bg-gray-100 rounded-full h-1.5 overflow-hidden ${className}`}>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      className="bg-indigo-600 h-full"
    />
  </div>
);

export default function FeedbackReport({ feedback, onClose }: FeedbackReportProps) {
  return (
    <div className="space-y-6 max-h-[80vh] overflow-auto pr-2 custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Performance Report</h2>
          <p className="text-gray-500">AI-generated analysis of your technical and communication skills.</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-indigo-600">{feedback.overallScore}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard 
          title="Technical Accuracy" 
          score={feedback.technicalAccuracy} 
          icon={<Target className="text-indigo-500" size={18} />} 
        />
        <ScoreCard 
          title="Clarity & Logic" 
          score={feedback.clarity} 
          icon={<TrendingUp className="text-emerald-500" size={18} />} 
        />
        <ScoreCard 
          title="Conciseness" 
          score={feedback.conciseness} 
          icon={<MessageSquare className="text-amber-500" size={18} />} 
        />
      </div>

      <Card className="border-none bg-gray-50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Volume2 size={16} />
            Communication Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CommunicationMetric label="Speech Pace" value={feedback.communicationSkills.pace} />
            <CommunicationMetric label="Jargon Control" value={feedback.communicationSkills.jargonUsage} />
            <CommunicationMetric label="Filler Words" value={feedback.communicationSkills.fillerWordCount} isCount />
            <CommunicationMetric label="Overall Impact" value={feedback.communicationSkills.effectiveness} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={20} />
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {feedback.pros.map((pro, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="text-sm flex items-start gap-2 bg-emerald-50/50 p-3 rounded-xl text-emerald-900"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {pro}
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={20} />
            Improvement Areas
          </h3>
          <ul className="space-y-2">
            {feedback.cons.map((con, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="text-sm flex items-start gap-2 bg-amber-50/50 p-3 rounded-xl text-amber-900"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {con}
              </motion.li>
            ))}
          </ul>
        </section>
      </div>

      <Card className="border-none bg-indigo-600 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Lightbulb size={200} />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={20} />
            AI Actionable Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {feedback.actionableTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs italic">
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="bg-gray-100 p-6 rounded-2xl">
        <h4 className="font-bold mb-2">Executive Summary</h4>
        <p className="text-sm text-gray-600 leading-relaxed italic">"{feedback.summary}"</p>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, icon }: { title: string, score: number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">{icon}</div>
          <span className="text-lg font-black text-gray-900">{score}%</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-gray-500 uppercase">{title}</div>
          <Progress value={score} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function CommunicationMetric({ label, value, isCount = false }: { label: string, value: number, isCount?: boolean }) {
  return (
    <div className="space-y-1 text-center md:text-left">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
      <div className="text-xl font-black text-gray-900">
        {isCount ? value : `${value}%`}
      </div>
      {!isCount && <Progress value={value} className="h-1 bg-gray-200" />}
    </div>
  );
}
