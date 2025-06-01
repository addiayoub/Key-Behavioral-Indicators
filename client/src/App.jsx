// App.js avec protection des routes
import { useState, useEffect } from 'react';
import './App.css';
import KBILyticsComponent from './KBILytics/KBILyticsComponent ';
import FlipAnimation from './FlipAnimation';
import FounderAuth from './founder/FounderAuth';
import FounderDashboard from './founder/FounderDashboard';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ClientApp from './client/ClientApp';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/founder" replace />;
};

// Composant pour rediriger si déjà connecté
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? <Navigate to="/founder/dashboard" replace /> : children;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          loading ? <FlipAnimation /> : <KBILyticsComponent/>
        } />
        
        <Route path="/founder" element={
          <AuthRoute>
            <FounderAuth />
          </AuthRoute>
        } />
        <Route path="/client-login" element={<ClientApp />} />


        <Route path="/founder/dashboard" element={
          <ProtectedRoute>
            <FounderDashboard />
          </ProtectedRoute>
        } />
        
        {/* Route de fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;