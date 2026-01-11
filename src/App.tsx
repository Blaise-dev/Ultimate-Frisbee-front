import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import AthleteDetail from './pages/AthleteDetail';
import Coaches from './pages/Coaches';
import CoachDetail from './pages/CoachDetail';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athletes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'COACH']}>
                <Athletes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athletes/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'COACH']}>
                <AthleteDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaches"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Coaches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaches/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CoachDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'COACH', 'ATHLETE']}>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'COACH', 'ATHLETE']}>
                <GroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <ProtectedRoute>
                <SessionDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
