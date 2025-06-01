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

// Configuration de l'API
const ClientHeader = ({ sidebarOpen, setSidebarOpen, activeTab, clientData }) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'employees': return 'Gestion des Employés';
      case 'responses': return 'Réponses des Employés';
      case 'analytics': return 'Analyses et Rapports';
      case 'settings': return 'Paramètres';
      default: return 'Dashboard';
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
            <p className="text-sm text-gray-400">{clientData.companyName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">Administration</p>
            <p className="text-xs text-gray-400">Client Dashboard</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ClientHeader