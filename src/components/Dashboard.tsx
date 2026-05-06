import { auth, db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickPrepAssessment from './QuickPrepAssessment';
import { Zap, X, Trophy, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [showQuickPrep, setShowQuickPrep] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userStats, setUserStats] = useState({
    xp: 0,
    totalSessions: 0,
    solved: 0,
    rank: 'Junior Engineer',
    nextRank: 'Senior Architect',
    progress: 0
  });

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const xp = data.xp || 0;
        
        // Simple rank Calculation
        let rank = 'Junior Engineer';
        let nextRank = 'Senior Architect';
        let progress = (xp % 1000) / 10;
        
        if (xp > 5000) {
          rank = 'Elite Architect';
          nextRank = 'Diamond Sentinel';
        } else if (xp > 2000) {
          rank = 'Senior Architect';
          nextRank = 'Elite Architect';
        }

        setUserStats({
          xp,
          totalSessions: data.totalSessions || 0,
          solved: data.solvedCount || Math.floor(xp / 100), // Fallback if no explicit solvedCount
          rank,
          nextRank,
          progress
        });
      }
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleQuickPrepClick = () => {
    if (isMobile) {
      navigate('/quick-prep');
    } else {
      setShowQuickPrep(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto relative"
    >
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Welcome back, {user?.displayName?.split(' ')[0] || 'Engineer'}</h2>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">System ready for technical assessment. Keep the streak alive.</p>
        </div>
        
        {/* Quick Prep Button - Only on Dashboard */}
        <button 
          onClick={handleQuickPrepClick}
          className="hidden md:flex items-center gap-3 bg-primary text-on-primary font-bold px-6 py-4 rounded-2xl custom-glow hover:brightness-110 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-xs"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Quick Prep</span>
        </button>
      </div>

      {/* Mobile Quick Prep Float */}
      <button 
        onClick={handleQuickPrepClick}
        className="md:hidden fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-primary text-on-primary font-bold px-6 py-4 rounded-full shadow-2xl active:scale-90 transition-all uppercase tracking-widest text-xs"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>Quick Prep</span>
      </button>

      <AnimatePresence>
        {showQuickPrep && !isMobile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickPrep(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-surface border border-outline-variant shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
              <div className="absolute top-6 right-6 z-10">
                <button 
                  onClick={() => setShowQuickPrep(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-on-surface-variant" />
                </button>
              </div>
              <QuickPrepAssessment isModal onClose={() => setShowQuickPrep(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-6">
        {/* Stats Section */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container p-6 border border-outline-variant custom-glow rounded-xl">
            <div className="flex justify-between items-start mb-4 text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              <span>Current XP</span>
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary">{userStats.xp.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-emerald-400 mt-2 flex items-center gap-1 uppercase">
              <TrendingUp className="w-3.5 h-3.5" />
              Keep growing
            </div>
          </div>

          <div className="bg-surface-container p-6 border border-outline-variant custom-glow rounded-xl">
            <div className="flex justify-between items-start mb-4 text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              <span>Global Rank</span>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="text-4xl font-bold text-on-surface">#{Math.max(1, 1000 - Math.floor(userStats.xp / 50))}</div>
            <div className="text-[11px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest">Active Member</div>
          </div>

          <div className="bg-surface-container p-6 border border-outline-variant custom-glow rounded-xl">
            <div className="flex justify-between items-start mb-4 text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              <span>Solved</span>
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div className="text-4xl font-bold text-on-surface">{userStats.solved}</div>
            <div className="text-[11px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest">Total Challenges</div>
          </div>

          {/* Progress Bar */}
          <div className="col-span-1 md:col-span-3 bg-surface-container p-6 border border-outline-variant custom-glow relative overflow-hidden rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Rank Progress: {userStats.rank}</h3>
                <p className="text-on-surface-variant text-sm mt-1">{Math.max(0, 1000 - (userStats.xp % 1000))} XP until {userStats.nextRank} rank</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-primary text-sm">{Math.floor(userStats.progress)}% Complete</span>
              </div>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary progress-glow rounded-full" style={{ width: `${userStats.progress}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
              <span>{userStats.rank}</span>
              <span>{userStats.nextRank}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
            <div className="bg-surface-container-high px-6 py-3 border-b border-outline-variant flex justify-between items-center text-[10px] font-bold tracking-widest text-on-surface uppercase">
              <span>Global Leaderboard</span>
              <a href="#" className="text-primary hover:underline">View All</a>
            </div>
            <div className="p-4 space-y-4">
              {[
                { rank: 1, name: 'j_doe_sys', xp: '45.2k', initials: 'JD' },
                { rank: 2, name: 'algo_master', xp: '42.8k', initials: 'AM' },
                { rank: Math.max(1, 1000 - Math.floor(userStats.xp / 50)), name: 'You', xp: `${(userStats.xp / 1000).toFixed(1)}k`, initials: user?.displayName?.split(' ').map(n => n[0]).join('') || 'ME', current: true },
              ].map((userItem) => (
                <div key={userItem.rank} className={`flex items-center justify-between p-2 rounded ${userItem.current ? 'bg-primary/10 border border-primary/20' : ''}`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-sm w-4 ${userItem.current ? 'text-primary' : 'text-on-surface-variant'}`}>{userItem.rank}</span>
                    <div className={`h-8 w-8 rounded flex items-center justify-center font-bold text-xs ${userItem.current ? 'border border-primary text-primary' : 'bg-surface-container-highest text-primary'}`}>
                      {userItem.initials}
                    </div>
                    <span className={`text-sm ${userItem.current ? 'font-semibold text-primary' : ''}`}>{userItem.name}</span>
                  </div>
                  <span className={`font-mono text-sm ${userItem.current ? 'text-primary' : 'text-on-surface'}`}>{userItem.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container border border-outline-variant rounded-xl relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ8dp5d82mpkAhdQql9UAcN1r6BETs3Ya2OUoopXcXYN9KWOGpalwkrlENQ9vZyQlFWFAq2ccWaUEalRG7zLxqJzaeFkdGOWq_BnVR_XQ_ZbwCTV4lwxFMhDBe9YdZYH5rQl4K7IzLNydEcWNit4FyK8tLuQxTzdENX5XpDxVP0UW4oeFU9f2Ryo_cRpdIB-9clo4awGeAtlT18zhbbN0F7jxAfwTEHt8zljlbx0fxWNRShHhekZoVFcs2tKYfMVL0-pgAZ8aMWVs" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative p-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-grow">
              <span className="inline-block px-2 py-1 bg-secondary-container text-on-secondary-container font-bold rounded text-[10px] mb-4 uppercase tracking-widest">Active Study Path</span>
              <h3 className="text-3xl font-bold text-on-surface mb-2">Distributed Systems Mastery</h3>
              <p className="text-on-surface-variant max-w-lg">Next Milestone: Implement a Raft Consensus Algorithm module. Focus on leader election and log replication consistency.</p>
              <div className="mt-8 flex items-center gap-6">
                <button className="bg-primary text-on-primary font-bold px-6 py-3 rounded text-[11px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">play_arrow</span>
                  Resume Module
                </button>
                <span className="font-mono text-on-surface-variant text-sm">Estimated: 45 mins</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle className="text-primary" cx="64" cy="64" fill="transparent" r="60" stroke="currentColor" strokeDasharray="377" strokeDashoffset="150" strokeWidth="4"></circle>
                </svg>
                <div className="text-center">
                  <div className="text-2xl font-bold text-on-surface">60%</div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Course</div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </motion.div>
  );
}
