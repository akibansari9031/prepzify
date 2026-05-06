export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  solvedProblems: number;
  streak: number;
  rank: number;
}

export interface Activity {
  id: string;
  type: 'code' | 'interview' | 'resume' | 'path';
  title: string;
  subtitle: string;
  timestamp: Date;
  xpGained: number;
}

export interface PathModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  status: 'completed' | 'in-progress' | 'locked';
}

export interface InterviewFeedback {
  overallScore: number;
  technicalAccuracy: number;
  clarity: number;
  conciseness: number;
  communicationSkills: {
    pace: number;
    jargonUsage: number;
    fillerWordCount: number;
    effectiveness: number;
  };
  pros: string[];
  cons: string[];
  actionableTips: string[];
  summary: string;
}

export interface Question {
  id: string;
  title: string;
  category: 'coding' | 'aptitude' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  solved: boolean;
  topic: string;
  branch: 'CSE' | 'AIML' | 'MECHANICAL' | 'CIVIL' | 'CHEMICAL' | 'ECE' | 'ALL';
  content: string;
  starterCode?: string;
  examples?: { input: string; output: string }[];
  constraints?: string[];
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

export type QuestionStore = {
  [branch: string]: {
    [topic: string]: {
      coding: Question[];
      aptitude: Question[];
      technical: Question[];
    };
  };
};

export interface InterviewMessage {
  role: 'user' | 'model';
  chunk: string;
  timestamp: number;
}
