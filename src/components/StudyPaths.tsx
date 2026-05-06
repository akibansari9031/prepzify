import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  Zap, 
  Flame, 
  Trophy, 
  ChevronRight,
  BookOpen,
  Layers,
  Cpu,
  Network,
  Cloud,
  Timer,
  ChevronDown,
  LayoutGrid,
  Route,
  PlayCircle,
  Star,
  GraduationCap,
  Sparkles,
  CreditCard
} from 'lucide-react';

const courses = [
  {
    id: 1,
    title: "Mastering Data Structures",
    platform: "Coursera",
    duration: "12 weeks",
    rating: 4.8,
    students: "125k",
    topic: "Computer Science",
    isFree: true,
    description: "Deep dive into Arrays, Linked Lists, Trees, and Graphs with memory management focus."
  },
  {
    id: 2,
    title: "Machine Learning Engineering",
    platform: "Coursera",
    duration: "10 weeks",
    rating: 4.9,
    students: "85k",
    topic: "AI/ML",
    isFree: true,
    description: "Build and deploy production-grade ML models using TensorFlow and PyTorch."
  },
  {
    id: 3,
    title: "System Design for Scale",
    platform: "Elite Prep",
    duration: "6 weeks",
    rating: 5.0,
    students: "12k",
    topic: "Architecture",
    isFree: true,
    description: "Architecting high-availability systems handles millions of RPS."
  },
  {
    id: 4,
    title: "The Frontend Architect",
    platform: "Elite Prep",
    duration: "8 weeks",
    rating: 4.7,
    students: "45k",
    topic: "Web Dev",
    isFree: true,
    description: "Advanced React patterns, micro-frontends, and performance monitoring."
  },
  {
    id: 5,
    title: "Advanced Database Internals",
    platform: "Stanford",
    duration: "14 weeks",
    rating: 4.9,
    students: "30k",
    topic: "Systems",
    isFree: false,
    description: "LSM trees, B-Trees, transaction isolation, and query optimization."
  },
  {
    id: 6,
    title: "Distributed Systems Theory",
    platform: "MIT OpenCourseWare",
    duration: "16 weeks",
    rating: 5.0,
    students: "20k",
    topic: "Distributed Systems",
    isFree: false,
    description: "Paxos, Raft, Byzantine Fault Tolerance, and consistency models."
  },
  {
    id: 7,
    title: "Low-Level Optimization",
    platform: "Elite Prep",
    duration: "5 weeks",
    rating: 4.8,
    students: "8k",
    topic: "Performance",
    isFree: false,
    description: "Assembly, Cache locality, SIMD instructions, and compiler optimizations."
  }
];

const milestones = [
  { 
    id: 1, 
    title: 'Data Structures & Big O', 
    description: 'Mastering time and space complexity with advanced graph traversal and amortized analysis.', 
    status: 'completed', 
    duration: '2.5h', 
    icon: LayoutGrid,
    tags: ['DS', 'Algorithms']
  },
  { 
    id: 2, 
    title: 'Concurrency & Multithreading', 
    description: 'Thread pools, mutexes, memory barriers, and lock-free programming in high-performance environments.', 
    status: 'in-progress', 
    duration: '4.0h', 
    icon: Cpu,
    tags: ['Low-Level', 'System']
  },
  { 
    id: 3, 
    title: 'Distributed Systems: LLD', 
    description: 'Designing highly available systems: Paxos, Raft, consistency models, and gossip protocols.', 
    status: 'locked', 
    duration: '8.5h', 
    icon: Network,
    tags: ['Architecture']
  },
  { 
    id: 4, 
    title: 'Cloud Native & K8s', 
    description: 'Service meshes, sidecar patterns, and infrastructure as code at massive scale.', 
    status: 'locked', 
    duration: '6.0h', 
    icon: Cloud,
    tags: ['DevOps', 'Scale']
  },
];

export default function StudyPaths() {
  const [activeView, setActiveView] = useState<'roadmap' | 'courses'>('roadmap');
  const [searchParams] = useSearchParams();
  const upgradeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('upgrade') === 'true') {
      if (activeView !== 'courses') {
        setActiveView('courses');
      }
      // Use a slightly longer timeout to ensure content is rendered
      const timer = setTimeout(() => {
        upgradeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, activeView]);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden bg-background">
      {/* Main Roadmap Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-5xl mx-auto p-4 md:p-12">
          {/* Header Section */}
          <div className="mb-8 lg:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                   <Route className="w-3 h-3" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Active Roadmap</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight">Backend Mastery <span className="text-primary">2.0</span></h2>
             </div>

             <div className="flex gap-2 p-1 bg-surface-container rounded-2xl border border-outline-variant/30">
                <button 
                  onClick={() => setActiveView('roadmap')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'roadmap' ? 'bg-primary text-black shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <Route className="w-4 h-4" />
                  Roadmap
                </button>
                <button 
                  onClick={() => setActiveView('courses')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'courses' ? 'bg-primary text-black shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Expert Courses
                </button>
             </div>
          </div>

          {activeView === 'roadmap' ? (
            /* Timeline Nodes */
            <div className="relative space-y-12">
              {/* Visual Continuity Line */}
              <div className="absolute left-[31px] top-6 bottom-0 w-px bg-gradient-to-b from-primary via-outline-variant to-transparent opacity-30" />

              {milestones.map((milestone, i) => (
                <motion.div 
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex gap-10 group relative ${milestone.status === 'locked' ? 'grayscale opacity-60' : ''}`}
                >
                  {/* Connector & Icon */}
                  <div className="relative z-10 hidden sm:block">
                     <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-500 bg-surface-container-low shadow-2xl
                       ${milestone.status === 'completed' ? 'border-secondary/40 text-secondary' : 
                         milestone.status === 'in-progress' ? 'border-primary text-primary active-glow-indigo' : 
                         'border-outline-variant text-on-surface-variant'}`}
                     >
                       <milestone.icon className={`w-7 h-7 ${milestone.status === 'in-progress' ? 'animate-pulse' : ''}`} />
                     </div>
                     {milestone.status === 'completed' && (
                       <div className="absolute -top-2 -right-2 bg-secondary text-black p-1 rounded-full shadow-lg">
                          <CheckCircle2 className="w-4 h-4" />
                       </div>
                     )}
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 pb-10 lg:pb-16">
                     <div className={`bg-surface-container p-5 md:p-8 rounded-3xl border transition-all duration-300 relative group-hover:border-primary/40
                       ${milestone.status === 'in-progress' ? 'border-primary/30 ring-1 ring-primary/20 bg-gradient-to-br from-surface-container to-primary/5' : 'border-outline-variant/30'}`}
                     >
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex gap-2">
                              {milestone.tags.map(tag => (
                                <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 text-on-surface-variant border border-white/5">
                                  {tag}
                                </span>
                              ))}
                           </div>
                           <div className="flex items-center gap-1.5 text-on-surface-variant">
                              <Timer className="w-3 h-3" />
                              <span className="text-[10px] font-mono font-bold tracking-tighter">{milestone.duration}</span>
                           </div>
                        </div>

                        <h3 className={`text-2xl font-bold mb-3 ${milestone.status === 'in-progress' ? 'text-white' : 'text-on-surface'}`}>
                          {milestone.title}
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed text-sm mb-6 max-w-2xl">
                          {milestone.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <div className="flex items-center gap-4">
                             {milestone.status === 'in-progress' ? (
                               <button className="bg-primary text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                                 Resume Deep Dive
                                 <ChevronRight className="w-4 h-4" />
                               </button>
                             ) : milestone.status === 'completed' ? (
                               <span className="text-secondary text-[10px] font-bold uppercase flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4" /> Completed & Mastery Attained
                               </span>
                             ) : (
                               <span className="text-on-surface-variant text-[10px] font-bold uppercase flex items-center gap-2 opacity-60">
                                 <Lock className="w-4 h-4" /> Prerequisite Required
                               </span>
                             )}
                          </div>
                          
                          <div className="flex -space-x-3 opacity-60">
                             {[1,2,3,4].map(i => (
                               <div key={i} className="w-7 h-7 rounded-full border-2 border-surface-container bg-surface-container-high" />
                             ))}
                          </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="pb-20 flex justify-center">
                 <button className="group flex flex-col items-center gap-3 text-on-surface-variant hover:text-white transition-all">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Load Future Milestones</span>
                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                 </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-24">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {courses.map((course) => (
                   <motion.div 
                     key={course.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`group bg-surface-container p-6 rounded-3xl border border-outline-variant/30 hover:border-primary/40 transition-all duration-300 relative overflow-hidden ${!course.isFree ? 'opacity-90' : ''}`}
                   >
                     {!course.isFree && (
                       <div className="absolute top-4 right-4 z-20">
                          <div className="bg-secondary/10 border border-secondary/20 text-secondary px-3 py-1 rounded-full flex items-center gap-2">
                             <Sparkles className="w-3 h-3" />
                             <span className="text-[8px] font-black uppercase tracking-[0.2em]">Elite Pro</span>
                          </div>
                       </div>
                     )}

                     <div className="flex items-start gap-5 mb-6">
                        <div className={`p-4 rounded-2xl ${course.isFree ? 'bg-primary/5 text-primary' : 'bg-secondary/5 text-secondary'}`}>
                           <PlayCircle className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{course.platform}</span>
                             <span className="w-1 h-1 rounded-full bg-outline-variant" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{course.topic}</span>
                           </div>
                           <h4 className="text-xl font-bold text-white tracking-tight leading-tight">{course.title}</h4>
                        </div>
                     </div>

                     <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                        {course.description}
                     </p>

                     <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5 text-warning">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-xs font-bold">{course.rating}</span>
                           </div>
                           <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{course.duration}</span>
                        </div>
                        
                        {course.isFree ? (
                          <button className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                             Start Learning
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-on-surface-variant opacity-50">
                             <Lock className="w-3 h-3" />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em]">Gated Content</span>
                          </div>
                        )}
                     </div>

                     {!course.isFree && (
                       <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-secondary text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                             Unlock with Pro
                             <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                     )}
                   </motion.div>
                 ))}
               </div>

               {/* Upgrade to Pro Card */}
               <motion.div 
                 ref={upgradeRef}
                 id="upgrade-card"
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 className="mt-12 h-auto md:h-[600px] bg-gradient-to-br from-secondary/30 via-primary/20 to-background p-8 md:p-12 rounded-[40px] border border-secondary/20 shadow-2xl relative overflow-hidden flex items-center"
               >
                 <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                 <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
                 
                 <div className="relative z-10 flex flex-col items-center lg:flex-row gap-8 md:gap-12 text-center lg:text-left">
                    <div className="p-8 bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl hidden md:block">
                       <CreditCard className="w-16 h-16 text-secondary" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
                          <Sparkles className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Subscription Plan</span>
                       </div>
                       <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Accelerate Your Engineering Career</h3>
                       <p className="text-on-surface-variant text-base md:text-lg max-w-xl">
                         Unlock 120+ pro courses, certification paths, and 1:1 expert mentorship sessions. 
                         The ultimate toolkit for senior engineering roles.
                       </p>
                    </div>

                    <div className="flex flex-col gap-4 min-w-full md:min-w-[240px]">
                       <button className="w-full bg-secondary text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all">
                          Upgrade to Pro
                       </button>
                       <p className="text-[10px] font-bold text-on-surface-variant text-center uppercase tracking-widest opacity-50">
                          Billed monthly. Cancel anytime.
                       </p>
                    </div>
                 </div>
               </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Persistence Sidebar */}
      <aside className="hidden lg:flex w-96 bg-surface-container-low border-l border-outline-variant p-8 flex-col gap-8 custom-scrollbar overflow-y-auto">
        <div className="space-y-6">
           <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" /> Cognitive Stats
           </h3>

           <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                 <div className="flex justify-between items-end relative z-10">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Current Streak</span>
                    <Flame className="text-[#f97316] w-5 h-5" />
                 </div>
                 <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-4xl font-black text-white">14</span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Days Logged</span>
                 </div>
              </div>

              <div className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Experience</span>
                    <Trophy className="text-primary w-5 h-5" />
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">Mastery <span className="text-primary">II</span></span>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-on-surface-variant tracking-widest">
                       <span>Progress to Level III</span>
                       <span>84%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '84%' }}
                          className="h-full bg-primary"
                        />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Next Recommended Step</h3>
           <div className="bg-surface-container border border-primary/20 rounded-3xl p-6 relative group cursor-pointer hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-primary/10 rounded-2xl">
                    <Layers className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-white">JVM Internals</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">35 Min Assessment</span>
                 </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4 group-hover:text-white transition-colors">
                Deep dive into G1 Garbage Collection and TLAB allocation. Required for 'Concurrency' proficiency.
              </p>
              <button className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                 Begin Assessment
              </button>
           </div>
        </div>

        <div className="mt-auto pt-8 border-t border-outline-variant/30">
           <div className="bg-gradient-to-r from-secondary/20 to-primary/20 p-6 rounded-3xl border border-secondary/10 flex items-center justify-between">
              <div>
                 <h4 className="font-bold text-sm text-white mb-1">Career Goal: FAANG L6</h4>
                 <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">ETA: October 2026</p>
              </div>
              <BookOpen className="w-6 h-6 text-white opacity-40" />
           </div>
        </div>
      </aside>
    </div>
  );
}
