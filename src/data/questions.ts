import { Question } from '../types';

export const DEPARTMENTS: Record<string, { name: string; topics: string[] }> = {
  CSE: { name: 'Computer Science', topics: ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'System Design'] },
  AIML: { name: 'AI & Machine Learning', topics: ['Neural Networks', 'Regression', 'Clustering', 'NLP', 'Computer Vision', 'Tensorflow', 'PyTorch'] },
  MECHANICAL: { name: 'Mechanical Engg', topics: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing', 'Machine Design', 'Heat Transfer', 'Engineering Mechanics'] },
  CIVIL: { name: 'Civil Engg', topics: ['Structural Analysis', 'Geotechnical', 'Transportation', 'Environmental Engg', 'Surveying', 'Concrete Technology'] },
  CHEMICAL: { name: 'Chemical Engg', topics: ['Mass Transfer', 'Reaction Kinetics', 'Thermodynamics', 'Process Control'] },
  ECE: { name: 'Electronics & Comm', topics: ['Signals and Systems', 'Embedded Systems', 'VLSI', 'Communication Systems', 'Digital Circuits'] }
};

export const BRANCHES = Object.keys(DEPARTMENTS) as (keyof typeof DEPARTMENTS)[];

export const TOPICS = Array.from(new Set(Object.values(DEPARTMENTS).flatMap(d => d.topics)));

export const QUESTIONS: Question[] = [
  { 
    id: '1',
    title: 'Two Sum', 
    topic: 'Data Structures', 
    branch: 'CSE', 
    category: 'coding', 
    difficulty: 'easy', 
    solved: false,
    content: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
    starterCode: 'const twoSum = (nums, target) => {\n  \n};'
  },
  { 
    id: '2',
    title: 'Valid Parentheses', 
    topic: 'Data Structures', 
    branch: 'CSE', 
    category: 'coding', 
    difficulty: 'easy', 
    solved: false,
    content: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}"'],
    examples: [{ input: 's = "()[]{}"', output: 'true' }, { input: 's = "(]"', output: 'false' }],
    starterCode: 'const isValid = (s) => {\n  \n};'
  }
];
