import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Info, ArrowUp, ArrowDown } from 'lucide-react';
import CategoryModal from './Modals/CategoryModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const CategoriesManager = ({ apiRequest, reloadData }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely get string values from potentially nested objects
  const getDisplayValue = (value, lang = 'fr') => {
    if (!value) return '';
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'object' && value !== null) {
      // Try the requested language first, then fallback to other languages
      if (lang === 'fr') {
        return value.fr || value.en || '';
      } else {
        return value.en || value.fr || '';
      }
    }
    
    return '';
  };

  // Fetch categories on mount and when reloadData changes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiRequest('/admin/categories');
        
        // Transform the response data if needed
        const transformedCategories = response.data.map(category => ({
          ...category,
          nom: getDisplayValue(category.nom, 'fr'),
          nomAng: getDisplayValue(category.nomAng, 'en'),
          description: getDisplayValue(category.description, 'fr'),
          descriptionAng: getDisplayValue(category.descriptionAng, 'en'),
        }));
        
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [apiRequest, reloadData]);

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
        await apiRequest(`/admin/categories/${id}`, {
          method: 'DELETE'
        });
        reloadData();
        MySwal.fire({
          icon: 'success',
          title: 'Supprimé!',
          text: 'La catégorie a été supprimée.',
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

  const updateOrder = async (id, direction) => {
    try {
      await apiRequest(`/admin/categories/${id}/ordre`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          ordre: direction === 'up' ? 1 : -1 
        })
      });
      reloadData();
    } catch (error) {
      console.error('Erreur mise à jour ordre:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Échec de la mise à jour',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const openDetails = (category) => {
    MySwal.fire({
      title: `Détails Catégorie: ${category.nom || 'Non spécifié'}`,
      html: `
        <div class="text-left space-y-3">
          <div>
            <p class="text-gray-400">Nom (Français):</p>
            <p class="text-white">${category.nom || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Nom (Anglais):</p>
            <p class="text-white">${category.nomAng || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Description (Français):</p>
            <p class="text-white">${category.description || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Description (Anglais):</p>
            <p class="text-white">${category.descriptionAng || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Ordre:</p>
            <p class="text-white">${category.ordre || 0}</p>
          </div>
          ${category.icon ? `
            <div>
              <p class="text-gray-400">Icône:</p>
              <img src="${category.icon}" alt="Icône" class="h-16 w-16 object-contain mt-2 mx-auto"/>
            </div>
          ` : ''}
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
        <h2 className="text-2xl font-bold text-white">Gestion des Catégories</h2>
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
          Nouvelle Catégorie
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ordre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Icône</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  Chargement en cours...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  Aucune catégorie trouvée
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <motion.tr 
                  key={category._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                  className="text-gray-300"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateOrder(category._id, 'up')}
                        className="text-gray-400 hover:text-orange-500"
                        title="Monter"
                      >
                        <ArrowUp size={16} />
                      </motion.button>
                      <span className="font-medium">{category.ordre || 0}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateOrder(category._id, 'down')}
                        className="text-gray-400 hover:text-orange-500"
                        title="Descendre"
                      >
                        <ArrowDown size={16} />
                      </motion.button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {category.nom || '-'}
                      </p>
                      {category.nomAng && (
                        <p className="text-xs text-gray-400">
                          EN: {category.nomAng}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="line-clamp-2">
                        {category.description || '-'}
                      </p>
                      {category.descriptionAng && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          EN: {category.descriptionAng}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {category.icon ? (
                      <div className="h-10 w-10 flex items-center justify-center">
                        <img 
                          src={category.icon} 
                          alt="Icône" 
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="text-gray-500 text-xs hidden">Erreur</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Aucune</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openDetails(category)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Détails"
                      >
                        <Info size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingItem(category);
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
                        onClick={() => handleDelete(category._id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingItem={editingItem}
        reloadData={reloadData}
        apiRequest={apiRequest}
      />
    </div>
  );
};

export default CategoriesManager;