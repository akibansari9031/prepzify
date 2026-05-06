import { motion } from 'motion/react';

const TOP_PLAYERS = [
  { rank: 1, name: 'j_doe_sys', xp: '45,210', solved: 432, streak: 45, level: 'Elite', color: 'emerald' },
  { rank: 2, name: 'algo_master', xp: '42,850', solved: 389, streak: 12, level: 'Elite', color: 'primary' },
  { rank: 3, name: 'rust_ace', xp: '39,120', solved: 356, streak: 89, level: 'Diamond', color: 'tertiary' },
];

const RECENT_RANKS = [
  { rank: 412, name: 'You', xp: '12,450', solved: 87, streak: 5, level: 'Gold' },
  { rank: 413, name: 'cloud_ninja', xp: '12,440', solved: 82, streak: 2, level: 'Gold' },
  { rank: 414, name: 'pixel_pusher', xp: '12,400', solved: 76, streak: 1, level: 'Gold' },
];

export default function Leaderboards() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">Global Rankings</h2>
        <p className="text-on-surface-variant text-sm md:text-base">The absolute elite of engineering world-wide.</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-4 md:pt-10">
        {TOP_PLAYERS.map((player) => (
          <motion.div 
            key={player.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: player.rank * 0.1 }}
            className={`relative bg-surface-container border border-outline-variant rounded-2xl p-8 text-center flex flex-col items-center group custom-glow ${player.rank === 1 ? 'md:-translate-y-6 border-emerald-400/30' : ''}`}
          >
            {player.rank === 1 && (
              <div className="absolute -top-4 bg-emerald-400 text-on-emerald px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Global Lead</div>
            )}
            <div className="h-20 w-20 rounded-full border-2 border-outline-variant flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl text-on-surface">account_circle</span>
                <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-${player.color === 'emerald' ? 'emerald-400' : 'primary'} flex items-center justify-center font-bold text-xs text-on-primary`}>
                    #{player.rank}
                </div>
            </div>
            <h3 className="text-xl font-bold text-on-surface">{player.name}</h3>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">{player.level} Architect</span>
            
            <div className="grid grid-cols-2 w-full gap-4 pt-6 border-t border-outline-variant/30">
                <div>
                    <span className="block text-2xl font-bold text-on-surface">{player.xp}</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Total XP</span>
                </div>
                <div>
                    <span className="block text-2xl font-bold text-on-surface">{player.solved}</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Solved</span>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Rankings */}
      <div className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-high border-b border-outline-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <tr>
                <th className="px-8 py-4 text-left">Rank</th>
                <th className="px-8 py-4 text-left">Engineer</th>
                <th className="px-8 py-4 text-left">Level</th>
                <th className="px-8 py-4 text-center">Problems</th>
                <th className="px-8 py-4 text-center">Streak</th>
                <th className="px-8 py-4 text-right">Experience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {RECENT_RANKS.map((user) => (
                <tr key={user.rank} className={`group hover:bg-surface-container-high transition-colors ${user.rank === 412 ? 'bg-primary/5' : ''}`}>
                  <td className="px-8 py-6">
                    <span className={`font-mono text-xl ${user.rank === 412 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{user.rank}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-primary">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`text-sm font-bold ${user.rank === 412 ? 'text-primary' : 'text-on-surface'}`}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-on-surface-variant">{user.level}</td>
                  <td className="px-8 py-6 text-center text-sm font-mono">{user.solved}</td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-primary">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      {user.streak}d
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-mono font-bold text-primary">{user.xp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
