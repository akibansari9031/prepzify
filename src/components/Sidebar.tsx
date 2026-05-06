import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut } from 'lucide-react';
import Logo from './Logo';
import { signOut } from '../lib/firebase';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
  { id: 'interview', label: 'Interview AI', icon: 'psychology', path: '/interview' },
  { id: 'code', label: 'Practice Arena', icon: 'code', path: '/code' },
  { id: 'paths', label: 'Study Paths', icon: 'route', path: '/paths' },
  { id: 'resume', label: 'Resume Check', icon: 'description', path: '/resume' },
  { id: 'leaderboards', label: 'Rankings', icon: 'leaderboard', path: '/leaderboards' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <aside 
        className={`bg-surface h-screen w-64 fixed left-0 top-0 border-r border-outline-variant flex flex-col py-6 z-50 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 mb-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="w-12 h-12 group-hover:scale-110 transition-transform" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tighter leading-none">
                <span className="text-[#0056b3]">Prep</span>
                <span className="text-[#ff9800]">Zify</span>
              </h1>
              <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#333333] mt-1.5">Empowering Preparation</p>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-grow space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-4 py-2 px-4 transition-all mx-2 rounded-lg ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span 
                  className="material-symbols-outlined shrink-0" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 space-y-2 pt-6">
          <div className="p-4 bg-surface-container rounded-lg mb-4 border border-outline-variant">
            <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">Pro Access</p>
            <p className="text-xs text-on-surface-variant mb-4">Unlimited AI mock sessions and deep analysis.</p>
            <Link 
              to="/paths?upgrade=true"
              className="w-full bg-primary text-on-primary font-bold py-2 rounded text-xs uppercase tracking-widest hover:brightness-110 transition-all text-center block"
            >
              Upgrade to Pro
            </Link>
          </div>
          
          <Link to="/settings" className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
            <span className="material-symbols-outlined shrink-0">settings</span>
            <span className="truncate">Settings</span>
          </Link>
          <Link to="/support" className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
            <span className="material-symbols-outlined shrink-0">help_outline</span>
            <span className="truncate">Support</span>
          </Link>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 py-2 px-4 text-error hover:bg-error/10 transition-colors rounded-lg mt-2"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="truncate font-bold text-xs uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>
    </AnimatePresence>
  );
}
