import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EmissionReportForm from './pages/EmissionReportForm';
import CreditsPage from './pages/CreditsPage';
import Marketplace from './pages/Marketplace';
import VerificationsPage from './pages/VerificationsPage';
import AuditLedgerPage from './pages/AuditLedgerPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* Dashboard acts as the main layout/wrapper for authenticated users */}
              <Dashboard user={currentUser} />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes inside the Dashboard Layout */}
          <Route index element={<HomePage />} />
          <Route path="report" element={<EmissionReportForm currentUser={currentUser} />} />
          <Route path="credits" element={<CreditsPage user={currentUser} />} />
          <Route path="marketplace" element={<Marketplace user={currentUser} />} />
          <Route path="verifications" element={<VerificationsPage user={currentUser} userRole={currentUser?.role} />} />
          <Route path="audit-ledger" element={<AuditLedgerPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
