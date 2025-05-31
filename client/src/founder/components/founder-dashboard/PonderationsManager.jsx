import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import PonderationModal from './Modals/PonderationModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PonderationsManager = ({ ponderations, apiRequest, reloadData }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPonderation, setSelectedPonderation] = useState(null);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas annuler cette action!",
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
        await apiRequest(`/admin/ponderations/${id}`, {
          method: 'DELETE'
        });
        reloadData();
        MySwal.fire({
          icon: 'success',
          title: 'Supprimé!',
          text: 'La pondération a été supprimée.',
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

  const openDetails = (pond) => {
    MySwal.fire({
      title: `Détails Pondération #${pond.id}`,
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Possibilités:</strong></p>
          <ul class="list-disc pl-5 mb-4">
            ${pond.possibilite.map(p => `<li>${p}</li>`).join('')}
          </ul>
          <div class="grid grid-cols-5 gap-4 mt-4">
            ${['Pr', 'Co', 'Op', 'Ad', 'Ci'].map(field => `
              <div class="bg-gray-700 p-3 rounded-lg text-center">
                <p class="text-sm text-gray-300">${field}</p>
                <p class="text-xl font-bold text-orange-500">${pond[field]}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `,
      background: '#1f2937',
      color: '#fff',
      confirmButtonColor: '#f97316',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Pondérations</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Pondération
        </motion.button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Possibilités</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valeurs</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {ponderations.map((pond) => (
              <motion.tr 
                key={pond._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                className="text-gray-300"
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium">{pond.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {pond.possibilite.slice(0, 3).map((p, i) => (
                      <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs">
                        {p}
                      </span>
                    ))}
                    {pond.possibilite.length > 3 && (
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                        +{pond.possibilite.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {['Pr', 'Co', 'Op', 'Ad', 'Ci'].map((field) => (
                      <div key={field} className="text-center">
                        <div className="text-xs text-gray-400">{field}</div>
                        <div className="font-bold text-orange-500">{pond[field]}</div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openDetails(pond)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Détails"
                    >
                      <Info size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingItem(pond);
                        setShowModal(true);
                      }}
                      className="text-orange-400 hover:text-orange-300 p-1"
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(pond._id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <PonderationModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingItem={editingItem}
        reloadData={reloadData}
        apiRequest={apiRequest}
      />
    </div>
  );
};

export default PonderationsManager;