import { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Moon, Sun, Monitor, Check, Loader2, Save } from 'lucide-react';
import { auth, updateUserProfile } from '../lib/firebase';

export default function Settings() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  const { theme, setTheme } = useTheme();

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateUserProfile(displayName);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 lg:space-y-10">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Settings</h2>
        <p className="text-on-surface-variant mt-1 text-sm md:text-base">Manage your account, preferences, and security.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-4 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-primary/20 flex items-center justify-center relative group bg-surface">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl md:text-4xl text-primary">person</span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg md:text-xl font-bold text-on-surface">{user?.displayName || 'Anonymous Engineer'}</h3>
              <p className="text-xs md:text-sm text-on-surface-variant">Technical Assessment Mode • Active Session</p>
              <div className="flex justify-center sm:justify-start gap-2 mt-3">
                <span className="bg-surface-container-high px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant">
                  {user?.emailVerified ? 'Verified' : 'Elite Tier'}
                </span>
                <span className="bg-surface-container-high px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant">Beta Access</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Senior Dev"
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
              <input 
                type="email" 
                defaultValue={user?.email || 'N/A'} 
                disabled 
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm opacity-60 cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Preferences</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">Theme Preference</p>
                  <p className="text-xs text-on-surface-variant">How would you like the application to look?</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
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
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-4 md:p-8 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Security</h4>
            <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-error-container/5 border border-error/20 rounded-xl gap-4">
                <div className="text-center md:text-left">
                    <p className="text-sm font-bold text-error">Danger Zone</p>
                    <p className="text-xs text-on-surface-variant">Permanently delete your account and all associated data.</p>
                </div>
                <button className="w-full md:w-auto px-6 py-2 bg-error text-on-error rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
                    Delete Account
                </button>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 md:gap-4">
            {saveStatus === 'success' && (
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Check className="w-3 h-3" /> Profile Updated
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-error text-[10px] font-bold uppercase tracking-widest">
                Update Failed
              </span>
            )}
            <button className="w-full sm:w-auto px-8 py-3 border border-outline-variant text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-surface-container-high transition-all">Discard Changes</button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-widest rounded-full hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Preferences
            </button>
        </div>
      </div>
    </div>
  );
}
