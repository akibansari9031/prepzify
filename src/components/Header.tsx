import { auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const user = auth.currentUser;

  return (
    <header className={`fixed top-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-4 md:px-6 transition-all duration-300 left-0 ${isSidebarOpen ? 'lg:left-64' : 'left-0'}`}>
      <div className="flex items-center gap-4 md:gap-10">
        <button 
          onClick={onMenuClick}
          className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <nav className="hidden md:flex gap-6 font-bold text-[11px] uppercase tracking-widest text-on-surface-variant">
          <Link to="/support" className="hover:text-primary transition-colors">Docs</Link>
          <Link to="/support" className="hover:text-primary transition-colors">Community</Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative group hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-32 md:w-64 transition-all"
          />
        </div>
        
        <Link to="/settings" className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high transition-transform active:scale-95">
          <img 
            src={user?.photoURL || "https://lh3.googleusercontent.com/a/default-user=s96-c"} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
