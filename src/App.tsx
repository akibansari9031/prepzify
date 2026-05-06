/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, auth } from './lib/firebase';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';

import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InterviewAI from './components/InterviewAI';
import PracticeQuestions from './components/PracticeQuestions';
import StudyPaths from './components/StudyPaths';
import ResumeCheck from './components/ResumeCheck';
import Leaderboards from './components/Leaderboards';
import Settings from './components/Settings';
import Support from './components/Support';
import QuickPrepAssessment from './components/QuickPrepAssessment';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={user ? <Navigate to="/" replace /> : <LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/interview" element={<InterviewAI />} />
                <Route path="/code" element={<PracticeQuestions />} />
                <Route path="/paths" element={<StudyPaths />} />
                <Route path="/resume" element={<ResumeCheck />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />
                <Route path="/quick-prep" element={<QuickPrepAssessment />} />
                {/* Fallback for protected routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
