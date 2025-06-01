import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const CategoryModal = ({ showModal, setShowModal, editingItem, reloadData, apiRequest }) => {
  const [form, setForm] = useState({
    nom: '',
    nomAng: '',
    description: '',
    descriptionAng: '',
    ordre: 0,
    icon: ''
  });
  const [uploading, setUploading] = useState(false);

  // Helper function pour obtenir l'URL complète de l'image
  const getFullImageUrl = (iconPath) => {
    if (!iconPath) return '';
    
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
      return iconPath;
    }
    
    // Construire l'URL complète avec l'URL du backend
    const backendUrl = import.meta.env.VITE_API_URL ;
    
    // S'assurer que le chemin commence par /
    const cleanPath = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
    
    return `${backendUrl}${cleanPath}`;
  };

  // Helper function pour extraire les valeurs selon le format
  const extractValue = (value, lang = 'fr') => {
    if (!value) return '';
    
    // Si c'est une chaîne simple
    if (typeof value === 'string') {
      return value;
    }
    
    // Si c'est un objet avec des langues
    if (typeof value === 'object' && value !== null) {
      if (lang === 'fr') {
        return value.fr || value.francais || value.french || '';
      } else if (lang === 'en') {
        return value.en || value.anglais || value.english || value.ang || '';
      }
    }
    
    return '';
  };

  useEffect(() => {
    console.log('🔄 CategoryModal - editingItem changed:', editingItem);
    
    if (editingItem) {
      console.log('📝 Extraction des données pour édition:', {
        nom: editingItem.nom,
        nomAng: editingItem.nomAng,
        nomFr: editingItem.nomFr,
        nomEn: editingItem.nomEn,
        description: editingItem.description,
        descriptionAng: editingItem.descriptionAng,
        icon: editingItem.icon
      });

      // Extraire les noms selon les différents formats possibles
      const nomFr = extractValue(editingItem.nom, 'fr') || 
                   editingItem.nomFr || 
                   editingItem.nom || '';
      
      const nomEn = extractValue(editingItem.nom, 'en') || 
                   editingItem.nomAng || 
                   editingItem.nomEn || 
                   extractValue(editingItem.nomAng, 'en') || '';

      // Extraire les descriptions selon les différents formats possibles
      const descFr = extractValue(editingItem.description, 'fr') || 
                     editingItem.descriptionFr || 
                     editingItem.description || '';
      
      const descEn = extractValue(editingItem.description, 'en') || 
                     editingItem.descriptionAng || 
                     editingItem.descriptionEn || 
                     extractValue(editingItem.descriptionAng, 'en') || '';

      const formData = {
        nom: nomFr,
        nomAng: nomEn,
        description: descFr,
        descriptionAng: descEn,
        ordre: Number(editingItem.ordre) || 0,
        icon: editingItem.icon || ''
      };

      console.log('✅ Données du formulaire configurées:', formData);
      setForm(formData);
    } else {
      console.log('🆕 Nouveau formulaire - réinitialisation');
      setForm({
        nom: '',
        nomAng: '',
        description: '',
        descriptionAng: '',
        ordre: 0,
        icon: ''
      });
    }
  }, [editingItem]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('icon', file);

      let response;
      
      if (editingItem) {
        response = await apiRequest(`/admin/categories/${editingItem._id}/icon`, {
          method: 'POST',
          body: formData
        }, true);
        
        // Mise à jour avec la réponse du serveur
        const newIconPath = response.data?.icon || response.icon || '';
        setForm(prev => ({ ...prev, icon: newIconPath }));
      } else {
        response = await apiRequest('/admin/upload-icon', {
          method: 'POST',
          body: formData
        }, true);
        
        const newIconPath = response.icon || response.data?.icon || '';
        setForm(prev => ({ ...prev, icon: newIconPath }));
      }
      
      console.log('✅ Upload réussi:', response);
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Échec du téléchargement de l\'icône',
        background: '#1f2937',
        color: '#fff'
      });
    } finally {
      setUploading(false);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const submitData = {
      nom: {
        fr: form.nom,
        en: form.nomAng
      },
      description: {
        fr: form.description,
        en: form.descriptionAng
      },
      ordre: Number(form.ordre),
      icon: form.icon
    };

    if (editingItem) {
      await apiRequest(`/admin/categories/${editingItem._id}`, {
        method: 'PUT',
        body: JSON.stringify(submitData)
      });
    } else {
      await apiRequest('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });
    }
      
      setShowModal(false);
      reloadData();
      
      MySwal.fire({
        icon: 'success',
        title: editingItem ? 'Catégorie mise à jour' : 'Catégorie créée',
        text: 'L\'opération a été effectuée avec succès.',
        showConfirmButton: false,
        timer: 1500,
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      console.error('❌ Erreur création/modification catégorie:', error);
      let errorMessage = 'Une erreur est survenue';
      if (error.message.includes('404')) {
        errorMessage = 'La catégorie n\'existe pas ou a été supprimée';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `Erreur serveur: ${error.message}`;
      }
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage,
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: showModal ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${showModal ? 'block' : 'hidden'}`}
      onClick={() => setShowModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {editingItem ? 'Modifier Catégorie' : 'Nouvelle Catégorie'}
          </h3>
          <button 
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom (Français) *
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({...form, nom: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                required
                placeholder="Nom en français"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom (Anglais)
              </label>
              <input
                type="text"
                value={form.nomAng}
                onChange={(e) => setForm({...form, nomAng: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="Nom en anglais"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (Français)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[100px] focus:border-orange-500 focus:outline-none resize-vertical"
                placeholder="Description en français"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (Anglais)
              </label>
              <textarea
                value={form.descriptionAng}
                onChange={(e) => setForm({...form, descriptionAng: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[100px] focus:border-orange-500 focus:outline-none resize-vertical"
                placeholder="Description en anglais"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ordre *
              </label>
              <input
                type="number"
                value={form.ordre}
                onChange={(e) => setForm({...form, ordre: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                required
                min="0"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Icône
              </label>
              <div className="flex items-center gap-3">
                {form.icon ? (
                  <>
                    <div className="h-12 w-12 flex items-center justify-center bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
                      <img 
                        src={getFullImageUrl(form.icon)} 
                        alt="Icône" 
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          console.error('❌ Erreur chargement image:', getFullImageUrl(form.icon));
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden h-full w-full items-center justify-center text-gray-500 text-xs">
                        Erreur
                      </div>
                    </div>
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                        disabled={uploading}
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`${uploading ? 'bg-gray-600' : 'bg-orange-500 hover:bg-orange-600'} text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors`}
                      >
                        <Upload size={16} />
                        {uploading ? 'Téléchargement...' : 'Changer'}
                      </motion.div>
                    </label>
                  </>
                ) : (
                  <label className="flex-1">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                      disabled={uploading}
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${uploading ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'} border border-gray-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors`}
                    >
                      <Image size={16} />
                      {uploading ? 'Téléchargement...' : 'Ajouter une icône'}
                    </motion.div>
                  </label>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              disabled={uploading}
            >
              {editingItem ? 'Mettre à jour' : 'Créer'}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Annuler
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CategoryModal;