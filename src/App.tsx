/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <Router>
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
        </Routes>
      </Layout>
    </Router>
  );
}
