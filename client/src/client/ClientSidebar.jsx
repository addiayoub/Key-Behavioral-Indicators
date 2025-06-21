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

// Configuration de l'API - Ajoutez votre URL backend ici
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClientSidebar = ({ activeTab, setActiveTab, sidebarOpen,  clientData, handleLogout }) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'responses', label: 'Réponses', icon: FileText },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
  ];

  // Fonction pour construire l'URL complète du logo
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    
    // Si le logoPath commence déjà par http, on le retourne tel quel
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // Sinon, on construit l'URL complète avec le backend
    return `${API_BASE_URL}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
  };

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: sidebarOpen ? 0 : -280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 z-40"
    >
      <div className="p-6">
        {/* Logo et info client */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {clientData.logo ? (
              <img 
                src={getLogoUrl(clientData.logo)} 
                alt="Logo" 
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  // En cas d'erreur de chargement, afficher l'icône par défaut
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {!clientData.logo && (
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            )}
            {/* Div de fallback en cas d'erreur de chargement du logo */}
            <div 
              className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg items-center justify-center"
              style={{ display: 'none' }}
            >
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white truncate">{clientData.companyName}</h1>
              <p className="text-sm text-gray-400">Dashboard Client</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Déconnexion</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientSidebar;