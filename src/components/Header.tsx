import { auth } from '../lib/firebase';
import { Link } from 'react-router-dom';

export default function Header() {
  const user = auth.currentUser;

  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-6">
      <div className="flex items-center gap-10">
        <nav className="flex gap-6 font-bold text-[11px] uppercase tracking-widest text-on-surface-variant">
          <Link to="/support" className="hover:text-primary transition-colors">Docs</Link>
          <Link to="/support" className="hover:text-primary transition-colors">Community</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
          />
        </div>
        
        
        <Link to="/settings" className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high">
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
