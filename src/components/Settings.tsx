import { useState } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Moon, Sun, Monitor, Check } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-on-surface">Settings</h2>
        <p className="text-on-surface-variant mt-1">Manage your account, preferences, and security.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative group">
              <span className="material-symbols-outlined text-4xl text-primary">person</span>
              <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white">edit</span>
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">Senior Dev</h3>
              <p className="text-sm text-on-surface-variant">Full Stack Architect • Seattle, WA</p>
              <div className="flex gap-2 mt-3">
                <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant">Elite Tier</span>
                <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant">Verified</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Display Name</label>
              <input type="text" defaultValue="Senior Dev" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
              <input type="email" defaultValue="dev@example.com" disabled className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
          <div className="p-8 space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Preferences</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">Theme Preference</p>
                  <p className="text-xs text-on-surface-variant">How would you like the application to look?</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      theme === t.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40'
                    }`}
                  >
                    <t.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                    {theme === t.id && <Check className="w-3 h-3 mt-1" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-outline-variant/30"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Push Notifications</p>
                <p className="text-xs text-on-surface-variant">Receive alerts for completed checks and new path availability.</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="h-px bg-outline-variant/30"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Public Leaderboard Profile</p>
                <p className="text-xs text-on-surface-variant">Hide your rank and XP from the global community.</p>
              </div>
              <button 
                onClick={() => setPublicProfile(!publicProfile)}
                className={`w-12 h-6 rounded-full transition-colors relative ${publicProfile ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${publicProfile ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Security</h4>
            <div className="flex items-center justify-between p-4 bg-error-container/5 border border-error/20 rounded-xl">
                <div>
                    <p className="text-sm font-bold text-error">Danger Zone</p>
                    <p className="text-xs text-on-surface-variant">Permanently delete your account and all associated data.</p>
                </div>
                <button className="px-6 py-2 bg-error text-on-error rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
                    Delete Account
                </button>
            </div>
        </div>

        <div className="flex justify-end gap-4">
            <button className="px-8 py-3 border border-outline-variant text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-surface-container-high transition-all">Discard Changes</button>
            <button className="px-8 py-3 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-widest rounded-full hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">Save Preferences</button>
        </div>
      </div>
    </div>
  );
}
