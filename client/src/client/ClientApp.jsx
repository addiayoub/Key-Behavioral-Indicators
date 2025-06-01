import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  FileText,
  Building2,
  Menu,
  X,
  Eye,
  EyeOff,
  Lock,
  User,
  TrendingUp,
  UserCheck,
  Clock,
  Activity
} from 'lucide-react';

import ClientDashboard from './ClientDashboard';
import ClientAuth from '../auth/ClientAuth';

const ClientApp = () => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('clientToken');
    if (token) {
      try {
        const parsedData = JSON.parse(token);
        setClientData(parsedData);
      } catch (error) {
        localStorage.removeItem('clientToken');
      }
    }
    setLoading(false);
  };

  const handleLogin = (data) => {
    setClientData(data);
  };

  const handleLogout = () => {
    setClientData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {clientData ? (
        <ClientDashboard clientData={clientData} onLogout={handleLogout} />
      ) : (
        <ClientAuth onLogin={handleLogin} />
      )}
    </div>
  );
};

export default ClientApp;