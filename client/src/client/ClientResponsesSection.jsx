import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, Filter, X, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ExportPDFButton from './ExportPDFButton';

const MySwal = withReactContent(Swal);
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClientResponsesSection = ({ clientData }) => {
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
  }, [clientData.clientId]);

  const getIndustryInEnglish = (response) => {
    // Chercher la réponse à la question d'industrie (questionId 6 dans votre exemple)
    const industryResponse = response.responses?.find(r => r.questionId === 6);
    
    if (industryResponse) {
      return industryResponse.answerTextAng || industryResponse.answerText;
    }
    
    // Fallback vers keyResponses si pas trouvé dans responses
    return response.keyResponses?.industry || '-';
  };

  // Fonction pour obtenir la phase de changement en anglais
// Fonction pour obtenir la phase de changement en anglais
const getChangePhaseInEnglish = (response) => {
  const changePhaseResponse = response.responses?.find(r => r.questionId === 9); // Utilisez le bon questionId pour la phase de changement
  
  if (changePhaseResponse) {
    // Prioriser answerTextAng (anglais) sur answerText (français)
    return changePhaseResponse.answerTextAng || changePhaseResponse.answerText;
  }
  
  return response.keyResponses?.changePhase || '-';
};

  // Fonction pour obtenir le type d'organisation en anglais
  const getOrganizationTypeInEnglish = (response) => {
    const orgTypeResponse = response.responses?.find(r => r.questionId === 8); // Ajustez le questionId selon votre structure
    
    if (orgTypeResponse) {
      return orgTypeResponse.answerTextAng || orgTypeResponse.answerText;
    }
    
    return response.keyResponses?.organizationType || '-';
  };

  // Et aussi cette fonction pour les filtres
  const getUniqueIndustriesInEnglish = () => {
    const industries = new Set();
    responses.forEach(response => {
      const industry = getIndustryInEnglish(response);
      if (industry && industry !== '-') {
        industries.add(industry);
      }
    });
    return Array.from(industries);
  };

  // Fonction pour obtenir les phases de changement uniques en anglais
  const getUniqueChangePhasesInEnglish = () => {
    const phases = new Set();
    responses.forEach(response => {
      const phase = getChangePhaseInEnglish(response);
      if (phase && phase !== '-') {
        phases.add(phase);
      }
    });
    return Array.from(phases);
  };

  // Fonction pour obtenir les types d'organisation uniques en anglais
  const getUniqueOrganizationTypesInEnglish = () => {
    const types = new Set();
    responses.forEach(response => {
      const type = getOrganizationTypeInEnglish(response);
      if (type && type !== '-') {
        types.add(type);
      }
    });
    return Array.from(types);
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/client-admin/${clientData.clientId}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        // Fix: Extract the responses array from the API response
        setResponses(data.responses || []);
      } else {
        throw new Error('Erreur lors du chargement des réponses');
      }
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

  const openDetails = (response) => {
    setSelectedResponse(response);
    setShowDetailsModal(true);
  };

  const filteredResponses = responses.filter(response => {
    const industryEng = getIndustryInEnglish(response);
    const changePhaseEng = getChangePhaseInEnglish(response);
    const orgTypeEng = getOrganizationTypeInEnglish(response);
    
    // Filter by search term
    const matchesSearch = 
      (response.employeeId && response.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (response.employeeName && response.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (response.employeeEmail && response.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (industryEng && industryEng.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (orgTypeEng && orgTypeEng.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (changePhaseEng && changePhaseEng.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by selected filters
    const matchesFilters = 
      (!filters.industry || industryEng === filters.industry) &&
      (!filters.organizationType || orgTypeEng === filters.organizationType) &&
      (!filters.changePhase || changePhaseEng === filters.changePhase);
    
    return matchesSearch && matchesFilters;
  });

  const getUniqueValues = (field) => {
    const values = new Set();
    responses.forEach(response => {
      if (response.keyResponses?.[field]) {
        values.add(response.keyResponses[field]);
      }
    });
    return Array.from(values);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "ID Employé,Nom,Email,Industrie,Type Organisation,Phase Changement,Score Total,Pr Score,Co Score,Op Score,Ad Score,Ci Score,KBI CONSO,Date\n";
    
    // Data rows
    filteredResponses.forEach(response => {
      const row = [
        response.employeeId || '',
        response.employeeName || '',
        response.employeeEmail || '',
        getIndustryInEnglish(response),
        getOrganizationTypeInEnglish(response),
        getChangePhaseInEnglish(response),
        Math.round(response.score || 0),
        Math.round(response.Pr || 0),
        Math.round(response.Co || 0),
        Math.round(response.Op || 0),
        Math.round(response.Ad || 0),
        Math.round(response.Ci || 0),
        Math.round(response.KBICONSO || 0),
        new Date(response.createdAt).toLocaleDateString()
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reponses_employes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour grouper les réponses par catégorie
  const groupResponsesByCategory = (responses) => {
    if (!responses || !Array.isArray(responses)) return {};
    
    const grouped = {};
    responses.forEach(response => {
      const category = response.categoryAng || response.category || 'Non catégorisé';
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
        <h2 className="text-2xl font-bold text-white">Réponses des Employés</h2>
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
          <motion.button>
            {clientData && (
              <ExportPDFButton responses={filteredResponses} clientData={clientData} asDiv={true} />
            )}
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
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative col-span-1 md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par ID, nom, email, industrie, type org. ou phase..."
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
            {getUniqueIndustriesInEnglish().map((industry, i) => (
              <option key={i} value={industry}>{industry}</option>
            ))}
          </select>
          
          <select
            value={filters.organizationType}
            onChange={(e) => setFilters({...filters, organizationType: e.target.value})}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Tous les types</option>
            {getUniqueOrganizationTypesInEnglish().map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.changePhase}
            onChange={(e) => setFilters({...filters, changePhase: e.target.value})}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Toutes les phases</option>
            {getUniqueChangePhasesInEnglish().map((phase, i) => (
              <option key={i} value={phase}>{phase}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Summary */}
      {responses.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Résumé</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{responses.length}</p>
              <p className="text-sm text-gray-400">Total Réponses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {Math.round(responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length)}%
              </p>
              <p className="text-sm text-gray-400">Score Moyen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {getUniqueIndustriesInEnglish().length}
              </p>
              <p className="text-sm text-gray-400">Industries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">
                {getUniqueOrganizationTypesInEnglish().length}
              </p>
              <p className="text-sm text-gray-400">Types Org.</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Industrie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type Org.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phase de Changement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">KBI CONSO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredResponses.map((response) => (
                <motion.tr 
                  key={response.employeeId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                  className="text-gray-300"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{response.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{response.employeeName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{response.employeeEmail || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getIndustryInEnglish(response)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getOrganizationTypeInEnglish(response)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getChangePhaseInEnglish(response)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-2 w-16 bg-gray-700 rounded-full mr-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" 
                          style={{ width: `${Math.min(response.score || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(response.score || 0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-400 font-semibold">
                      {Math.round(response.KBICONSO || 0)}%
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
                    </div>
                  </td>
                </motion.tr>
              ))}
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
                  Détails des Réponses - {selectedResponse.employeeName || selectedResponse.employeeId}
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
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">Informations Employé</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Nom</p>
                      <p className="text-white">{selectedResponse.employeeName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{selectedResponse.employeeEmail || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">ID Employé</p>
                      <p className="text-white">{selectedResponse.employeeId}</p>
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">Informations Clés</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Industrie</p>
                      <p className="text-white">{getIndustryInEnglish(selectedResponse)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Type d'Organisation</p>
                      <p className="text-white">{getOrganizationTypeInEnglish(selectedResponse)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phase de Changement</p>
                      <p className="text-white">{getChangePhaseInEnglish(selectedResponse)}</p>
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
                          <p className="text-sm text-gray-400">{category.categoryAngShort || category.categoryShort}</p>
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
                        {Math.round(selectedResponse.KBICONSO || 0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Scores */}
                {selectedResponse.categoryScores && selectedResponse.categoryScores.length > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-orange-400 mb-3">Détails par Catégorie</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedResponse.categoryScores.map((category, i) => (
                        <div key={i} className="bg-gray-800 p-4 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-white">{category.categoryAng || category.category}</h5>
                            <span className="text-sm text-gray-400">({category.categoryAngShort || category.categoryShort})</span>
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
                                {categoryResponses[0]?.categoryAngShort || categoryResponses[0]?.categoryShort || category.substring(0, 2)}
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

  export default ClientResponsesSection;