import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/founder-dashboard/Sidebar';
import Header from './components/founder-dashboard/Header';
import ClientModal from './components/founder-dashboard/Modals/ClientModal';
import PonderationModal from './components/founder-dashboard/Modals/PonderationModal';
import DashboardStats from './components/founder-dashboard/DashboardStats';
import ClientsManager from './components/founder-dashboard/ClientsManager';
import PonderationsManager from './components/founder-dashboard/PonderationsManager';
import QuestionsManager from './components/founder-dashboard/QuestionsManager';
import UserResponsesManager from './components/founder-dashboard/UserResponsesManager';
import CategoriesManager from './components/founder-dashboard/CategoriesManager'; // Import ajouté

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FounderDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalEmployees: 0,
    totalResponses: 0
  });
  
  const [categories, setCategories] = useState([]); // État déjà présent mais pas utilisé
  
  // États pour les données
  const [clients, setClients] = useState([]);
  const [ponderations, setPonderations] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // États pour les modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Configuration API
  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  // Charger les données initiales
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, clientsData, ponderationsData, questionsData, categoriesData] = await Promise.all([
        apiRequest('/admin/dashboard-stats'),
        apiRequest('/admin/clients'),
        apiRequest('/admin/ponderations'),
        apiRequest('/admin/questions'),
        apiRequest('/admin/categories') // Ajout de l'appel pour les catégories
      ]);
      
      setDashboardStats(statsData);
      setClients(clientsData);
      setPonderations(ponderationsData);
      setQuestions(questionsData);
      setCategories(categoriesData); // Mise à jour de l'état des catégories
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/founder';
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={dashboardStats} clients={clients} />;
      case 'clients':
        return <ClientsManager clients={clients} onOpenModal={openModal} reloadData={loadDashboardData} />;
      case 'ponderations':
        return <PonderationsManager ponderations={ponderations} onOpenModal={openModal} reloadData={loadDashboardData} />;
      case 'questions':
        return <QuestionsManager questions={questions} apiRequest={apiRequest} reloadData={loadDashboardData} />;
      case 'categories': // Ajout du cas pour les catégories
        return <CategoriesManager categories={categories} apiRequest={apiRequest} reloadData={loadDashboardData} />;
      case 'employees':
        return <div className="text-white">Section Employés - En développement</div>;
      case 'settings':
        return <div className="text-white">Section Paramètres - En développement</div>;
      case 'responses':
        return <UserResponsesManager apiRequest={apiRequest} reloadData={loadDashboardData} />;
      default:
        return <DashboardStats stats={dashboardStats} clients={clients} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        handleLogout={handleLogout}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <Header
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          activeTab={activeTab}
        />
        
        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            {modalType === 'client' && (
              <ClientModal
                showModal={showModal}
                setShowModal={setShowModal}
                editingItem={editingItem}
                reloadData={loadDashboardData}
                apiRequest={apiRequest}
              />
            )}
            
            {modalType === 'ponderation' && (
              <PonderationModal
                showModal={showModal}
                setShowModal={setShowModal}
                editingItem={editingItem}
                reloadData={loadDashboardData}
                apiRequest={apiRequest}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FounderDashboard;