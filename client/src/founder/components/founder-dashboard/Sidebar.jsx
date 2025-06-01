import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home,
  Building2, 
  Users, 
  BarChart3, 
  HelpCircle, 
  Settings,
  LogOut,
  FileText,
  LayoutPanelLeft
} from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'employees', label: 'Employés', icon: Users },
    { id: 'responses', label: 'Réponses', icon: FileText }, 
  { id: 'ponderations', label: 'Pondérations', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: LayoutPanelLeft }, // Remplacez categoryIcon par l'icône appropriée

  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, handleLogout }) => {
  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: sidebarOpen ? 0 : -280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 z-40"
    >
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className=" flex items-center justify-center">
            <div className="flex items-center justify-center mx-auto mb-7">
                <img src="/Picture2.png" alt="Logo" className="w-100" />
            </div>          </div>
        
        </div>

        {/* Navigation */}
        <nav className="space-y-2 cursor-pointer">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-lg transition-all ${
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
            className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Déconnexion</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;