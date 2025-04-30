import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TournamentCreate from './pages/TournamentCreate';
import TournamentView from './pages/TournamentView';
import EventParticipants from './pages/BracketMaking';
import Timer from './pages/Timer';
import ParticipantAdd from './pages/ParticipantAdd';
import ParticipantEdit from './pages/ParticipantEdit';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tournament/create" element={<TournamentCreate />} />
              <Route path="/tournament/:id" element={<TournamentView />} />

              <Route path="/tournament/:id/brackets" element={
                <ErrorBoundary>
                  <EventParticipants />
                </ErrorBoundary>
              } />

              <Route path="/tournament/:id/participants/add" element={<ParticipantAdd />} />
              <Route path="/tournament/:id/participants/:participantId/edit" element={<ParticipantEdit />} />
              <Route path="/timer" element={<Timer />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
