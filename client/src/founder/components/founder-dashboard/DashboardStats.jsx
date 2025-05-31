import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, UserPlus, BarChart3 } from 'lucide-react';
import StatCard from './StatCard';

const DashboardStats = ({ stats, clients }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Building2}
          color="hover:border-orange-500/50"
        />
        <StatCard
          title="Clients Actifs"
          value={stats.activeClients}
          icon={Users}
          color="hover:border-orange-500/50"
        />
        <StatCard
          title="Total Employés"
          value={stats.totalEmployees}
          icon={UserPlus}
          color="hover:border-orange-500/50"
        />
        <StatCard
          title="Réponses"
          value={stats.totalResponses}
          icon={BarChart3}
          color="hover:border-orange-500/50"
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Clients Récents</h3>
        <div className="space-y-3">
          {clients.slice(0, 5).map((client) => (
            <div key={client._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-white">{client.companyName}</p>
                <p className="text-sm text-gray-400">{client.currentEmployees}/{client.maxEmployees} employés</p>
              </div>
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                Actif
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;