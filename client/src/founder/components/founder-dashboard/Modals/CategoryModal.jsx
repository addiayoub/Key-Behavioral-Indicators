import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image } from 'lucide-react';

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

  useEffect(() => {
    if (editingItem) {
      setForm({
        nom: editingItem.nom || '',
        nomAng: editingItem.nomAng || '',
        description: editingItem.description || '',
        descriptionAng: editingItem.descriptionAng || '',
        ordre: editingItem.ordre || 0,
        icon: editingItem.icon || ''
      });
    } else {
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

      // Si c'est une modification, on utilise la route spécifique pour upload
      if (editingItem) {
        const response = await apiRequest(`/admin/categories/${editingItem._id}/icon`, {
          method: 'POST',
          body: formData
        }, true); // Passer true pour ne pas ajouter le header Content-Type

        setForm({ ...form, icon: response.data.icon });
      } else {
        // Pour une nouvelle catégorie, on stocke temporairement le fichier
        const response = await apiRequest('/admin/upload-icon', {
          method: 'POST',
          body: formData
        }, true);

        setForm({ ...form, icon: response.icon });
      }
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiRequest(`/admin/categories/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
      } else {
        await apiRequest('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(form)
        });
      }
      setShowModal(false);
      reloadData();
    } catch (error) {
      console.error('Erreur création/modification catégorie:', error);
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom (Français)</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({...form, nom: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom (Anglais)</label>
              <input
                type="text"
                value={form.nomAng}
                onChange={(e) => setForm({...form, nomAng: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description (Français)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description (Anglais)</label>
              <textarea
                value={form.descriptionAng}
                onChange={(e) => setForm({...form, descriptionAng: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ordre</label>
              <input
                type="number"
                value={form.ordre}
                onChange={(e) => setForm({...form, ordre: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Icône</label>
              <div className="flex items-center gap-3">
                {form.icon ? (
                  <>
                    <div className="h-12 w-12 flex items-center justify-center bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={form.icon} 
                        alt="Icône" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
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
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
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
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              {editingItem ? 'Mettre à jour' : 'Créer'}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
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