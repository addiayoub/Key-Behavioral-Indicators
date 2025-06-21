import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Info, Search, Download, Filter, X } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const UserResponsesManager = ({ apiRequest, reloadData }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    organizationType: '',
    changePhase: ''
  });

  useEffect(() => {
    fetchResponses();
  }, []);

  // Fonction pour extraire les valeurs des questions de base
  const extractBasicInfo = (responses) => {
    if (!responses || !Array.isArray(responses)) return {};
    
    const basicInfo = {};
    responses.forEach(response => {
      switch(response.questionId) {
        case 6: // Industry
          basicInfo.industry = response.answerTextAng || response.answerText;
          break;
        case 8: // Change Phase
          basicInfo.changePhase = response.answerTextAng || response.answerText;
          break;
        case 9: // Organization Type (Maturity)
          basicInfo.organizationType = response.answerTextAng || response.answerText;
          break;
      }
    });
    return basicInfo;
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/admin/responses');
      console.log('Données reçues:', data);
      
      // Enrichir chaque réponse avec les informations de base extraites
      const enrichedData = data.map(response => ({
        ...response,
        basicInfo: extractBasicInfo(response.responses)
      }));
      
      setResponses(enrichedData);
    } catch (error) {
      console.error('Error fetching responses:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger les réponses',
        background: '#1f2937',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const result = await MySwal.fire({
      title: 'Êtes-vous sûr?',
      text: "Toutes les réponses de cet utilisateur seront supprimées définitivement!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler',
      background: '#1f2937',
      color: '#fff'
    });
    
    if (result.isConfirmed) {
      try {
        await apiRequest(`/admin/responses/${userId}`, {
          method: 'DELETE'
        });
        fetchResponses();
        MySwal.fire({
          icon: 'success',
          title: 'Supprimé!',
          text: 'Les réponses ont été supprimées.',
          showConfirmButton: false,
          timer: 1500,
          background: '#1f2937',
          color: '#fff'
        });
      } catch (error) {
        MySwal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.message || 'Échec de la suppression',
          background: '#1f2937',
          color: '#fff'
        });
      }
    }
  };

  const openDetails = (response) => {
    console.log('Réponse sélectionnée:', response);
    setSelectedResponse(response);
    setShowDetailsModal(true);
  };

  const filteredResponses = responses.filter(response => {
    // Utiliser basicInfo au lieu de keyResponses
    const industry = response.basicInfo?.industry || response.keyResponses?.industry;
    const organizationType = response.basicInfo?.organizationType || response.keyResponses?.organizationType;
    const changePhase = response.basicInfo?.changePhase || response.keyResponses?.changePhase;
    
    // Filter by search term
    const matchesSearch = 
      response.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (industry && industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (organizationType && organizationType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (changePhase && changePhase.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by selected filters
    const matchesFilters = 
      (!filters.industry || (industry && industry === filters.industry)) &&
      (!filters.organizationType || (organizationType && organizationType === filters.organizationType)) &&
      (!filters.changePhase || (changePhase && changePhase === filters.changePhase));
    
    return matchesSearch && matchesFilters;
  });

  const getUniqueValues = (field) => {
    const values = new Set();
    responses.forEach(response => {
      // Chercher dans basicInfo d'abord, puis dans keyResponses
      const value = response.basicInfo?.[field] || response.keyResponses?.[field];
      if (value) {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "User ID,Industry,Organization Type,Change Phase,Total Score,Pr Score,Co Score,Op Score,Ad Score,Ci Score,KBI CONSO,Date\n";
    
    // Data rows
    filteredResponses.forEach(response => {
      const industry = response.basicInfo?.industry || response.keyResponses?.industry || '';
      const organizationType = response.basicInfo?.organizationType || response.keyResponses?.organizationType || '';
      const changePhase = response.basicInfo?.changePhase || response.keyResponses?.changePhase || '';
      
      const row = [
        response.userId,
        industry,
        organizationType,
        changePhase,
        Math.round(response.totalScore?.score || 0),
        Math.round(response.kbiScores?.Pr || 0),
        Math.round(response.kbiScores?.Co || 0),
        Math.round(response.kbiScores?.Op || 0),
        Math.round(response.kbiScores?.Ad || 0),
        Math.round(response.kbiScores?.Ci || 0),
        Math.round(response.kbiScores?.KBICONSO || 0),
        new Date(response.createdAt).toLocaleDateString()
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_responses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour grouper les réponses par catégorie
  const groupResponsesByCategory = (responses) => {
    if (!responses || !Array.isArray(responses)) return {};
    
    const grouped = {};
    responses.forEach(response => {
      const category = response.category || 'Non catégorisé';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(response);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Réponses Utilisateurs</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchResponses}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Actualiser
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
       {/* Search and Filters */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-1 md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par ID, industrie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <select
            value={filters.industry}
            onChange={(e) => setFilters({...filters, industry: e.target.value})}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Toutes les industries</option>
            {getUniqueValues('industry').map((industry, i) => (
              <option key={i} value={industry}>{industry}</option>
            ))}
          </select>
          
          <select
            value={filters.organizationType}
            onChange={(e) => setFilters({...filters, organizationType: e.target.value})}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Tous les types</option>
            {getUniqueValues('organizationType').map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>


      {/* Statistics Summary */}
      {responses.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Résumé</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{responses.length}</p>
              <p className="text-sm text-gray-400">Total Réponses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {Math.round(responses.reduce((sum, r) => sum + (r.totalScore?.score || 0), 0) / responses.length)}%
              </p>
              <p className="text-sm text-gray-400">Score Moyen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {getUniqueValues('industry').length}
              </p>
              <p className="text-sm text-gray-400">Industries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">
                {getUniqueValues('organizationType').length}
              </p>
              <p className="text-sm text-gray-400">Types Org.</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-500">
                {getUniqueValues('changePhase').length}
              </p>
              <p className="text-sm text-gray-400">Phases</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Industrie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phase de Changement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">KBI CONSO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredResponses.map((response) => {
                const industry = response.basicInfo?.industry || response.keyResponses?.industry;
                const organizationType = response.basicInfo?.organizationType || response.keyResponses?.organizationType;
                const changePhase = response.basicInfo?.changePhase || response.keyResponses?.changePhase;
                
                return (
                  <motion.tr 
                    key={response.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                    className="text-gray-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{response.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{industry || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{organizationType || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{changePhase || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2 w-16 bg-gray-700 rounded-full mr-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" 
                            style={{ width: `${Math.min(response.totalScore?.score || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(response.totalScore?.score || 0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-400 font-semibold">
                        {Math.round(response.kbiScores?.KBICONSO || 0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openDetails(response)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Détails"
                        >
                          <Info size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(response.userId)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredResponses.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {responses.length === 0 ? 'Aucune réponse trouvée' : 'Aucune réponse ne correspond aux filtres'}
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Détails des Réponses - {selectedResponse.userId}
                </h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Key Information */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">Informations Clés</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Industrie</p>
                      <p className="text-white">
                        {selectedResponse.basicInfo?.industry || selectedResponse.keyResponses?.industry || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Type d'Organisation</p>
                      <p className="text-white">
                        {selectedResponse.basicInfo?.organizationType || selectedResponse.keyResponses?.organizationType || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phase de Changement</p>
                      <p className="text-white">
                        {selectedResponse.basicInfo?.changePhase || selectedResponse.keyResponses?.changePhase || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* KBI Scores */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">Scores par Catégorie</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {selectedResponse.categoryScores && selectedResponse.categoryScores.length > 0 ? (
                      selectedResponse.categoryScores.map((category, i) => (
                        <div key={i} className="bg-gray-800 p-3 rounded text-center">
                          <p className="text-sm text-gray-400">{category.categoryShort || category.categoryAngShort}</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {Math.round(category.score || 0)}%
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-5 bg-gray-800 p-3 rounded text-center">
                        <p className="text-sm text-gray-400">Aucun score disponible</p>
                      </div>
                    )}
                    <div className="bg-gray-800 p-3 rounded text-center border-2 border-orange-500">
                      <p className="text-sm text-orange-400">KBI CONSO</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {Math.round(selectedResponse.kbiScores?.KBICONSO || 0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Scores */}
                {selectedResponse.categoryScores && selectedResponse.categoryScores.length > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-orange-400 mb-3">Scores par Catégorie</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedResponse.categoryScores.map((category, i) => (
                        <div key={i} className="bg-gray-800 p-4 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-white">{category.category || category.categoryAng}</h5>
                            <span className="text-sm text-gray-400">({category.categoryShort || category.categoryAngShort})</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(category.score || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-orange-400">{Math.round(category.score || 0)}%</span>
                            <span className="text-gray-400">
                              {category.rawScore || 0}/{category.maxPossible || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Responses grouped by Category */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">
                    Réponses Détaillées ({selectedResponse.responses?.length || 0})
                  </h4>
                  
                  {(() => {
                    const groupedResponses = groupResponsesByCategory(selectedResponse.responses);
                    
                    return Object.keys(groupedResponses).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(groupedResponses).map(([category, categoryResponses]) => (
                          <div key={category} className="border border-gray-600 rounded-lg p-4">
                            <h5 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-sm">
                                {categoryResponses[0]?.categoryShort || category.substring(0, 2)}
                              </span>
                              {category}
                            </h5>
                            
                            <div className="space-y-2">
                              {categoryResponses.map((response, i) => (
                                <motion.div 
                                  key={`${category}-${i}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.02 }}
                                  className="bg-gray-800 p-3 rounded border-l-4 border-orange-500"
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono">
                                          Q{response.questionId}
                                        </span>
                                        {response.required && (
                                          <span className="px-1 py-0.5 bg-red-900 text-red-300 rounded text-xs">
                                            Requis
                                          </span>
                                        )}
                                      </div>
                                      <p className="font-medium text-white mb-2 leading-relaxed">
                                        {response.questionTextAng || response.questionText || 'Question non disponible'}
                                      </p>

                                      <div className="bg-gray-900 p-2 rounded">
                                        <p className="text-sm text-gray-400 mb-1">Réponse:</p>
                                        <p className="text-orange-400 font-medium">
                                          {response.answerTextAng || response.answerText || 'Réponse non disponible'}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="text-right flex-shrink-0">
                                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        (response.score || 0) >= 75 ? 'bg-green-900 text-green-300' :
                                        (response.score || 0) >= 50 ? 'bg-yellow-900 text-yellow-300' :
                                        (response.score || 0) >= 25 ? 'bg-orange-900 text-orange-300' :
                                        'bg-red-900 text-red-300'
                                      }`}>
                                        {response.score || 0} pts
                                      </div>
                                      <p className="text-xs text-gray-400 mt-1">
                                        ID: {response.answerId !== undefined ? response.answerId : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            
                            {/* Category Summary */}
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">
                                  {categoryResponses.length} question{categoryResponses.length > 1 ? 's' : ''}
                                </span>
                                <span className="text-blue-400">
                                  Total: {categoryResponses.reduce((sum, r) => sum + (r.score || 0), 0)} points
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        Aucune réponse détaillée disponible
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserResponsesManager;