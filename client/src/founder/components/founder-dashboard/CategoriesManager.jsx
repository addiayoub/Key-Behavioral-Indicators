import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Info, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
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
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper function pour obtenir l'URL complète de l'image
  const getFullImageUrl = (iconPath) => {
    if (!iconPath) return '';
    
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
      return iconPath;
    }
    
    // Construire l'URL complète avec l'URL du backend
    const backendUrl = import.meta.env.VITE_API_URL;
    
    // S'assurer que le chemin commence par /
    const cleanPath = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
    
    return `${backendUrl}${cleanPath}`;
  };

  // Helper function pour valider les IDs
  const isValidId = (id) => {
    return id && typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Helper function avec validation améliorée
  const getDisplayValue = (value, lang = 'fr') => {
    if (!value) return '';
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'object' && value !== null) {
      if (lang === 'fr') {
        return value.fr || value.en || '';
      } else {
        return value.en || value.fr || '';
      }
    }
    
    return '';
  };

  // Normaliser les données pour l'affichage
  const normalizeCategory = (category) => {
    return {
      ...category,
      // Gérer les différents formats de nom
      nomFr: getDisplayValue(category.nom, 'fr') || category.nomFr || '',
      nomEn: getDisplayValue(category.nomAng || category.nom, 'en') || category.nomEn || '',
      // Gérer les différents formats de description
      descriptionFr: getDisplayValue(category.description, 'fr') || category.descriptionFr || '',
      descriptionEn: getDisplayValue(category.descriptionAng || category.description, 'en') || category.descriptionEn || '',
      // S'assurer que l'ordre est un nombre
      ordre: Number(category.ordre) || 0,
    };
  };

  // Fonction pour valider une catégorie
  const validateCategory = (category) => {
    if (!category || typeof category !== 'object') return false;
    if (!category._id || !isValidId(category._id)) return false;
    return true;
  };

  // Fetch categories avec meilleure gestion d'erreur
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des catégories...');
      const response = await apiRequest('/admin/categories');
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('Format de réponse invalide');
      }

      const transformedCategories = response.data
        .filter(validateCategory) // Filtrer les catégories invalides
        .map(normalizeCategory) // Normaliser les données
        .sort((a, b) => a.ordre - b.ordre); // Tri côté client aussi
      
      console.log('✅ Catégories chargées:', transformedCategories.length);
      setCategories(transformedCategories);
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement des catégories:', err);
      setError(err.message || 'Échec du chargement des catégories');
      setCategories([]);
      
      // Notification d'erreur
      MySwal.fire({
        icon: 'error',
        title: 'Erreur de chargement',
        text: 'Impossible de charger les catégories. Vérifiez votre connexion.',
        background: '#1f2937',
        color: '#fff'
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, reloadData]);

  // Delete avec confirmation et meilleure gestion
  const handleDelete = async (id) => {
    if (!isValidId(id)) {
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID de catégorie invalide',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    const category = categories.find(cat => cat._id === id);
    if (!category) {
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Catégorie non trouvée',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    const result = await MySwal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Supprimer la catégorie "${category.nomFr || category.nomEn}" ? Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
      background: '#1f2937',
      color: '#fff'
    });
    
    if (result.isConfirmed) {
      try {
        setIsUpdating(true);
        
        await apiRequest(`/admin/categories/${id}`, {
          method: 'DELETE'
        });

        // Mise à jour optimiste de l'état local
        setCategories(prev => prev.filter(cat => cat._id !== id));
        
        MySwal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'La catégorie a été supprimée.',
          showConfirmButton: false,
          timer: 1500,
          background: '#1f2937',
          color: '#fff'
        });

        // Recharger pour s'assurer de la cohérence
        setTimeout(() => {
          fetchCategories();
        }, 500);

      } catch (error) {
        console.error('❌ Erreur suppression:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.message || 'Échec de la suppression',
          background: '#1f2937',
          color: '#fff'
        });
        
        // Recharger en cas d'erreur pour rétablir l'état
        fetchCategories();
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Update order avec validation améliorée
  const updateOrder = async (id, direction) => {
    if (!isValidId(id)) {
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID de catégorie invalide',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    const category = categories.find(cat => cat._id === id);
    if (!category) {
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Catégorie non trouvée dans la liste locale',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    // Vérifications avant envoi
    const currentIndex = categories.findIndex(cat => cat._id === id);
    if (direction === 'up' && currentIndex === 0) {
      MySwal.fire({
        icon: 'info',
        title: 'Information',
        text: 'La catégorie est déjà en première position',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }
    
    if (direction === 'down' && currentIndex === categories.length - 1) {
      MySwal.fire({
        icon: 'info',
        title: 'Information',
        text: 'La catégorie est déjà en dernière position',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      console.log('🔄 Mise à jour ordre:', { id, direction, categoryName: category.nomFr });

      await apiRequest(`/admin/categories/${id}/ordre`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          ordre: direction === 'up' ? 1 : -1 
        })
      });

      MySwal.fire({
        icon: 'success',
        title: 'Succès',
        text: `Catégorie "${category.nomFr || category.nomEn}" déplacée ${direction === 'up' ? 'vers le haut' : 'vers le bas'}.`,
        showConfirmButton: false,
        timer: 1500,
        background: '#1f2937',
        color: '#fff'
      });

      // Recharger pour obtenir l'ordre correct
      await fetchCategories();

    } catch (error) {
      console.error('❌ Erreur mise à jour ordre:', error);
      
      let errorMessage = 'Échec de la mise à jour de l\'ordre';
      if (error.message.includes('404')) {
        errorMessage = 'La catégorie n\'existe pas ou a été supprimée';
      } else if (error.message.includes('401')) {
        errorMessage = 'Non autorisé: veuillez vous reconnecter';
      } else if (error.message.includes('400')) {
        errorMessage = 'Données invalides envoyées au serveur';
      }

      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage,
        background: '#1f2937',
        color: '#fff'
      });

      // Recharger pour rétablir l'état correct
      fetchCategories();
    } finally {
      setIsUpdating(false);
    }
  };

  // Open details avec validation
  const openDetails = (category) => {
    if (!validateCategory(category)) {
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Données de catégorie invalides',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    const fullImageUrl = category.icon ? getFullImageUrl(category.icon) : '';

    MySwal.fire({
      title: `Détails Catégorie: ${category.nomFr || category.nomEn || 'Non spécifié'}`,
      html: `
        <div class="text-left space-y-3">
          <div>
            <p class="text-gray-400">ID:</p>
            <p class="text-white text-xs font-mono">${category._id}</p>
          </div>
          <div>
            <p class="text-gray-400">Nom (Français):</p>
            <p class="text-white">${category.nomFr || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Nom (Anglais):</p>
            <p class="text-white">${category.nomEn || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Description (Français):</p>
            <p class="text-white">${category.descriptionFr || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Description (Anglais):</p>
            <p class="text-white">${category.descriptionEn || 'Non spécifié'}</p>
          </div>
          <div>
            <p class="text-gray-400">Ordre:</p>
            <p class="text-white">${category.ordre || 0}</p>
          </div>
          ${fullImageUrl ? `
            <div>
              <p class="text-gray-400">Icône:</p>
              <img src="${fullImageUrl}" alt="Icône" class="h-16 w-16 object-contain mt-2 mx-auto" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"/>
              <div style="display:none" class="text-red-400 text-sm mt-2">Erreur de chargement de l'image</div>
            </div>
          ` : ''}
        </div>
      `,
      background: '#1f2937',
      color: '#fff',
      confirmButtonColor: '#f97316',
    });
  };

  // Manuel refresh
  const handleManualRefresh = () => {
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Gestion des Catégories</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleManualRefresh}
            disabled={isLoading || isUpdating}
            className="text-gray-400 hover:text-white disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${(isLoading || isUpdating) ? 'animate-spin' : ''}`} />
          </motion.button>
          {categories.length > 0 && (
            <span className="text-sm text-gray-400">
              {categories.length} catégorie{categories.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          disabled={isUpdating}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Catégorie
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={handleManualRefresh}
            className="text-red-400 hover:text-red-300 text-sm underline"
          >
            Réessayer
          </button>
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
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Chargement en cours...
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  <div className="space-y-2">
                    <p>Aucune catégorie trouvée</p>
                    <button 
                      onClick={handleManualRefresh}
                      className="text-orange-400 hover:text-orange-300 text-sm underline"
                    >
                      Actualiser la liste
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <motion.tr 
                  key={`${category._id}-${category.ordre}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                  className={`text-gray-300 ${isUpdating ? 'opacity-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateOrder(category._id, 'up')}
                        className="text-gray-400 hover:text-orange-500 disabled:opacity-50"
                        title="Monter"
                        disabled={index === 0 || isUpdating}
                      >
                        <ArrowUp size={16} />
                      </motion.button>
                      <span className="font-medium min-w-[2ch] text-center">
                        {category.ordre}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateOrder(category._id, 'down')}
                        className="text-gray-400 hover:text-orange-500 disabled:opacity-50"
                        title="Descendre"
                        disabled={index === categories.length - 1 || isUpdating}
                      >
                        <ArrowDown size={16} />
                      </motion.button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {category.nomFr || '-'}
                      </p>
                      {category.nomEn && category.nomEn !== category.nomFr && (
                        <p className="text-xs text-gray-400">
                          EN: {category.nomEn}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="line-clamp-2">
                        {category.descriptionFr || '-'}
                      </p>
                      {category.descriptionEn && category.descriptionEn !== category.descriptionFr && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          EN: {category.descriptionEn}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {category.icon ? (
                      <div className="h-10 w-10 flex items-center justify-center">
                        <img 
                          src={getFullImageUrl(category.icon)} 
                          alt="Icône" 
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            console.error('❌ Erreur chargement image:', getFullImageUrl(category.icon));
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
                        disabled={isUpdating}
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
                        disabled={isUpdating}
                      >
                        <Edit size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(category._id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Supprimer"
                        disabled={isUpdating}
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
        reloadData={fetchCategories}
        apiRequest={apiRequest}
      />
    </div>
  );
};

export default CategoriesManager;