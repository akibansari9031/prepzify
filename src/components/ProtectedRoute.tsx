import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, auth } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant animate-pulse">Syncing Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to landing if not logged in
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
