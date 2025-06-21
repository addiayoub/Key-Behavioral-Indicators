import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Building, 
  Calendar,
  TrendingUp,
  BarChart3,
  User,
  Mail,
  Clock,
  Award,
  ChevronDown,
  ChevronRight,
  FileText,
  Target
} from 'lucide-react';

const EmployeesManager = ({ apiRequest, reloadData }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    skip: 0,
    total: 0
  });
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalResponses: 0,
    employeesWithResponses: 0,
    employeesWithoutResponses: 0,
    averageResponsesPerEmployee: 0
  });

  useEffect(() => {
    loadEmployees();
    loadClients();
  }, [selectedClient, pagination.limit, pagination.skip]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        skip: pagination.skip.toString()
      });
      
      if (selectedClient) {
        params.append('clientId', selectedClient);
      }

      const data = await apiRequest(`/admin/employees/with-responses?${params}`);
      
      if (data.success) {
        setEmployees(data.data.employees);
        setPagination(prev => ({ ...prev, total: data.data.pagination.total }));
        setStatistics(data.data.statistics);
      }
    } catch (error) {
      console.error('Erreur chargement employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await apiRequest('/admin/clients');
      setClients(data);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  const exportEmployeeData = async (employee) => {
    try {
      const dataToExport = {
        employee: {
          name: employee.name,
          email: employee.email,
          client: employee.client?.companyName,
          createdAt: employee.createdAt
        },
        statistics: employee.responseStats,
        responses: employee.responses
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employee_${employee.name.replace(/\s+/g, '_')}_data.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Fonction pour construire l'URL complète du logo
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    // Construire l'URL avec l'URL du backend
    return `${API_BASE_URL}${logoPath}`;
  };

  // Composant pour afficher le logo de l'entreprise
  const CompanyLogo = ({ client, size = 'w-8 h-8' }) => {
    const [imageError, setImageError] = useState(false);
    const logoUrl = getLogoUrl(client?.logo);

    if (!logoUrl || imageError) {
      // Afficher une icône par défaut si pas de logo ou erreur
      return (
        <div className={`${size} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
          <Building size={size.includes('w-8') ? 16 : 20} className="text-white" />
        </div>
      );
    }

    return (
      <img
        src={logoUrl}
        alt={`Logo ${client?.companyName}`}
        className={`${size} object-cover rounded-lg border border-gray-600`}
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'orange' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-white text-xl font-bold">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-orange-400" />
            Gestion des Employés
          </h1>
          <p className="text-gray-400 mt-1">
            Gérez les employés et visualisez leurs réponses aux questionnaires
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          title="Total Employés"
          value={statistics.totalEmployees}
          color="blue"
        />
        <StatCard
          icon={FileText}
          title="Total Réponses"
          value={statistics.totalResponses}
          color="green"
        />
        <StatCard
          icon={Award}
          title="Ont Répondu"
          value={statistics.employeesWithResponses}
          color="purple"
        />
        <StatCard
          icon={Clock}
          title="Sans Réponse"
          value={statistics.employeesWithoutResponses}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          title="Moy. Réponses"
          value={statistics.averageResponsesPerEmployee.toFixed(1)}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400 appearance-none min-w-[200px]"
            >
              <option value="">Tous les clients</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center p-8 text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucun employé trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredEmployees.map((employee) => (
              <motion.div
                key={employee._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setExpandedEmployee(
                        expandedEmployee === employee._id ? null : employee._id
                      )}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedEmployee === employee._id ? 
                        <ChevronDown size={20} /> : 
                        <ChevronRight size={20} />
                      }
                    </button>
                    
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white">{employee.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          {employee.email}
                        </span>
                        {employee.client && (
                          <span className="flex items-center space-x-2">
                            <CompanyLogo client={employee.client} size="w-5 h-5" />
                            <span>{employee.client.companyName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {employee.responseStats.totalResponses} réponse(s)
                      </p>
                      {employee.responseStats.averageScore !== null && (
                        <p className={`text-sm ${getScoreColor(employee.responseStats.averageScore)}`}>
                          Score moyen: {employee.responseStats.averageScore.toFixed(1)}%
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => exportEmployeeData(employee)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Exporter les données"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedEmployee === employee._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pl-14"
                    >
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3 flex items-center">
                          <BarChart3 size={16} className="mr-2" />
                          Historique des Réponses ({employee.responses.length})
                        </h4>
                        
                        {employee.responses.length === 0 ? (
                          <p className="text-gray-400 text-sm">Aucune réponse enregistrée</p>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {employee.responses.map((response, index) => (
                              <div
                                key={response._id}
                                className="bg-gray-600/30 rounded-lg p-3 flex items-center justify-between"
                              >
                                <div>
                                  <div className="flex items-center space-x-4 mb-2">
                                    <span className="text-sm font-medium text-white">
                                      Réponse #{index + 1}
                                    </span>
                                    <span className={`text-sm font-medium ${getScoreColor(response.scores.total.score)}`}>
                                      {response.scores.total.score}% ({response.scores.total.rawScore}/{response.scores.total.maxPossible})
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                                    <span className="flex items-center">
                                      <Calendar size={12} className="mr-1" />
                                      {formatDate(response.createdAt)}
                                    </span>
                                    <span className="flex items-center">
                                      <Target size={12} className="mr-1" />
                                      {response.questionResponses.length} questions
                                    </span>
                                    {response.metadata.completionTime && (
                                      <span className="flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        {Math.round(response.metadata.completionTime / 60)}min
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleViewResponse(response)}
                                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                                  title="Voir les détails"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <span className="text-gray-400 text-sm">
            Affichage de {pagination.skip + 1} à {Math.min(pagination.skip + pagination.limit, pagination.total)} sur {pagination.total} employés
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
              disabled={pagination.skip === 0}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
              disabled={pagination.skip + pagination.limit >= pagination.total}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Response Details Modal */}
      <AnimatePresence>
        {showResponseModal && selectedResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowResponseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Détails de la Réponse</h2>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Scores Summary */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Scores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">
                        {selectedResponse.scores.total.score}%
                      </p>
                      <p className="text-sm text-gray-400">Score Total</p>
                    </div>
                    {selectedResponse.scores.kbi.Pr && (
                      <>
                        <div className="text-center">
                          <p className="text-lg font-medium text-blue-400">
                            {selectedResponse.scores.kbi.Pr}
                          </p>
                          <p className="text-sm text-gray-400">Pr</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-green-400">
                            {selectedResponse.scores.kbi.Co}
                          </p>
                          <p className="text-sm text-gray-400">Co</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-purple-400">
                            {selectedResponse.scores.kbi.Op}
                          </p>
                          <p className="text-sm text-gray-400">Op</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-yellow-400">
                            {selectedResponse.scores.kbi.Ad}
                          </p>
                          <p className="text-sm text-gray-400">Ad</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-red-400">
                            {selectedResponse.scores.kbi.Ci}
                          </p>
                          <p className="text-sm text-gray-400">Ci</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Category Scores */}
                {selectedResponse.scores.categories.length > 0 && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Scores par Catégorie</h3>
                    <div className="space-y-2">
                      {selectedResponse.scores.categories.map((cat, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-300">{cat.category}</span>
                          <span className={`font-medium ${getScoreColor(cat.score)}`}>
                            {cat.score}% ({cat.rawScore}/{cat.maxPossible})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Responses */}
                {selectedResponse.keyResponses && Object.keys(selectedResponse.keyResponses).length > 0 && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Informations Clés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedResponse.keyResponses.industry && (
                        <div>
                          <p className="text-sm text-gray-400">Industrie</p>
                          <p className="text-white">{selectedResponse.keyResponses.industry}</p>
                        </div>
                      )}
                      {selectedResponse.keyResponses.organizationType && (
                        <div>
                          <p className="text-sm text-gray-400">Type d'Organisation</p>
                          <p className="text-white">{selectedResponse.keyResponses.organizationType}</p>
                        </div>
                      )}
                      {selectedResponse.keyResponses.changePhase && (
                        <div>
                          <p className="text-sm text-gray-400">Phase de Changement</p>
                          <p className="text-white">{selectedResponse.keyResponses.changePhase}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Métadonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Date de création</p>
                      <p className="text-white">{formatDate(selectedResponse.createdAt)}</p>
                    </div>
                    {selectedResponse.metadata.completionTime && (
                      <div>
                        <p className="text-gray-400">Temps de completion</p>
                        <p className="text-white">{Math.round(selectedResponse.metadata.completionTime / 60)} minutes</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400">Langue</p>
                      <p className="text-white">{selectedResponse.metadata.language || 'fr'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Session ID</p>
                      <p className="text-white font-mono text-xs">{selectedResponse.sessionId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeesManager;