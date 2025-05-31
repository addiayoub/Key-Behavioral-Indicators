import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, ChevronDown, ChevronUp, Users, X } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ClientsManager = ({ clients, onOpenModal, reloadData, apiRequest }) => {
  const [expandedClient, setExpandedClient] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return '';
    if (logoPath.startsWith('http') || logoPath.startsWith('data:')) return logoPath;
    const apiUrl = import.meta.env.VITE_API_URL;
    return `${apiUrl}${logoPath.startsWith('/') ? logoPath : '/' + logoPath}`;
  };

  const toggleClientDetails = (clientId) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
  };

  const handleDelete = async (clientId, clientName) => {
    MySwal.fire({
      title: <span className="text-xl font-bold">Confirmation</span>,
      html: <p>Êtes-vous sûr de vouloir supprimer <b>{clientName}</b> et tous ses employés ?</p>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      background: '#1f2937',
      color: '#f3f4f6',
      backdrop: `
        rgba(0,0,0,0.8)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await apiRequest(`/admin/clients/${clientId}`, {
            method: 'DELETE'
          });
          
          MySwal.fire({
            title: 'Supprimé!',
            text: `Le client ${clientName} a été supprimé.`,
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#1f2937',
            color: '#f3f4f6'
          });
          
          reloadData();
        } catch (error) {
          MySwal.fire({
            title: 'Erreur!',
            text: error.message || 'Échec de la suppression',
            icon: 'error',
            background: '#1f2937',
            color: '#f3f4f6'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Clients</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenModal('client')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Client
        </motion.button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Login Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Employés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {clients.map((client) => (
                <React.Fragment key={client._id}>
                  <tr className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {client.logo ? (
                          <img 
                            src={getLogoUrl(client.logo)} 
                            alt={`Logo ${client.companyName}`} 
                            className="w-10 h-10 rounded-lg object-cover border border-gray-600 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center border border-gray-500">
                            <span className="text-gray-400 text-xs font-bold">
                              {client.companyName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{client.companyName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{client.admin?.login}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.currentEmployees}/{client.maxEmployees}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpenModal('client', client)}
                          className="p-1 text-blue-400 hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleClientDetails(client._id)}
                          className="p-1 text-green-400 hover:text-green-300"
                          title="Voir détails"
                        >
                          {expandedClient === client._id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(client._id, client.companyName)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Supprimer"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Section détaillée avec animation */}
                  <AnimatePresence>
                    {expandedClient === client._id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-750"
                      >
                        <td colSpan="5" className="px-6 py-4">
                          <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col md:flex-row gap-6"
                          >
                            {/* Section Infos Client */}
                            <div className="flex-1 bg-gray-700 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Informations du Client
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-400">Nom de l'entreprise</p>
                                  <p className="text-white">{client.companyName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Login Admin</p>
                                  <p className="text-white">{client.admin?.login}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Login Employé</p>
                                  <p className="text-white">{client.employeeAccess?.login}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Employés</p>
                                  <p className="text-white">
                                    <span className={client.currentEmployees === client.maxEmployees ? 'text-red-400' : 'text-green-400'}>
                                      {client.currentEmployees}
                                    </span>
                                    <span className="text-gray-400"> / {client.maxEmployees}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Section Employés */}
                            <div className="flex-1 bg-gray-700 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold text-orange-400 mb-4">
                                Employés ({client.currentEmployees})
                              </h3>
                              {client.currentEmployees > 0 ? (
                                <div className="space-y-3">
                                  {[...Array(Math.min(3, client.currentEmployees))].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ x: -20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: 0.1 * i }}
                                      className="flex items-center gap-3 p-2 bg-gray-600 rounded-lg"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                                        {i + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-white">Employé {i + 1}</p>
                                        <p className="text-xs text-gray-400">poste@exemple.com</p>
                                      </div>
                                      <button className="text-gray-400 hover:text-white">
                                        <Eye className="h-4 w-4" />
                                      </button>
                                    </motion.div>
                                  ))}
                                  {client.currentEmployees > 3 && (
                                    <motion.div
                                      initial={{ scale: 0.9, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="text-center pt-2"
                                    >
                                      <button className="text-orange-400 text-sm hover:underline">
                                        Voir les {client.currentEmployees - 3} autres employés...
                                      </button>
                                    </motion.div>
                                  )}
                                </div>
                              ) : (
                                <motion.div
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  className="text-center py-6 text-gray-400"
                                >
                                  Aucun employé enregistré
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                          
                          {/* Graphique (exemple) */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 bg-gray-700 p-4 rounded-lg"
                          >
                            <h3 className="text-lg font-semibold text-orange-400 mb-4">
                              Statistiques d'engagement
                            </h3>
                            <div className="h-40 flex items-end gap-2">
                              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                                <motion.div
                                  key={day}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${Math.random() * 80 + 20}%` }}
                                  transition={{ delay: 0.1 * i, type: 'spring' }}
                                  className={`flex-1 rounded-t-sm ${
                                    i % 2 === 0 ? 'bg-orange-500' : 'bg-orange-400'
                                  }`}
                                  title={`${day}: ${Math.floor(Math.random() * 100)}%`}
                                />
                              ))}
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsManager;