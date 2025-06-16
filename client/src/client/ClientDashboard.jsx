import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity
} from 'lucide-react';
import DashboardStats from './DashboardStats';
import ClientHeader from './ClientHeader';
import ClientSidebar from './ClientSidebar';
import ClientResponsesSection from './ClientResponsesSection';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClientDashboard = ({ clientData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    maxEmployees: 0,
    currentEmployees: 0,
    responsesCount: 0,
    responses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/client-admin/${clientData.clientId}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    onLogout();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <DashboardStats dashboardData={dashboardData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Activité Récente</h3>
                <div className="space-y-3">
                  {dashboardData.responses.slice(0, 5).map((response, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <Activity className="h-4 w-4 text-orange-400" />
                      <div className="flex-1">
                        <p className="text-sm text-white">Nouvelle réponse reçue</p>
                        <p className="text-xs text-gray-400">
                          {new Date(response.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Taux de participation</span>
                    <span className="text-white font-medium">
                      {dashboardData.maxEmployees > 0 ? 
                        `${Math.round((dashboardData.currentEmployees / dashboardData.maxEmployees) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: dashboardData.maxEmployees > 0 ? 
                          `${(dashboardData.currentEmployees / dashboardData.maxEmployees) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );
      case 'employees':
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-6">Gestion des Employés</h2>
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-400">Section en développement - Gestion des employés</p>
            </div>
          </div>
        );
   case 'responses':
  return (
    <ClientResponsesSection clientData={clientData} />
  );
      case 'analytics':
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-6">Analyses et Rapports</h2>
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-400">Section en développement - Analyses détaillées</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-6">Paramètres</h2>
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-400">Section en développement - Paramètres du compte</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <ClientSidebar
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        clientData={clientData}
        handleLogout={handleLogout}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <ClientHeader
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          activeTab={activeTab}
          clientData={clientData}
        />
        
        <main className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard