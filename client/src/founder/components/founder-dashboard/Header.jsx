import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen, activeTab }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Tableau de bord';
      case 'clients': return 'Clients';
      case 'ponderations': return 'Pondérations';
      case 'employees': return 'Employés';
      case 'questions': return 'Questions';
      case 'settings': return 'Paramètres';
      default: return 'Tableau de bord';
    }
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
          <h1 className="text-xl font-semibold text-white">{getTitle()}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;