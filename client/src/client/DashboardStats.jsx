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
const API_BASE_URL = import.meta.env.VITE_API_URL;


const DashboardStats = ({ dashboardData }) => {
  const stats = [
    {
      title: 'Employés Max',
      value: dashboardData.maxEmployees,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Employés Actuels',
      value: dashboardData.currentEmployees,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Total Réponses',
      value: dashboardData.responsesCount,
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/20'
    },
    {
      title: 'Taux Participation',
      value: dashboardData.maxEmployees > 0 ? 
        `${Math.round((dashboardData.currentEmployees / dashboardData.maxEmployees) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardStats