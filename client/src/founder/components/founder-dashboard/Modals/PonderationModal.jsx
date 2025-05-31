import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Plus, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PonderationModal = ({ showModal, setShowModal, editingItem, reloadData, apiRequest }) => {
  const [form, setForm] = useState({
    id: '',
    possibilite: [],
    Pr: 0,
    Co: 0,
    Op: 0,
    Ad: 0,
    Ci: 0
  });
  const [newPossibility, setNewPossibility] = useState('');

  useEffect(() => {
    if (editingItem) {
      setForm({
        id: editingItem.id || '',
        possibilite: editingItem.possibilite || [],
        Pr: editingItem.Pr || 0,
        Co: editingItem.Co || 0,
        Op: editingItem.Op || 0,
        Ad: editingItem.Ad || 0,
        Ci: editingItem.Ci || 0
      });
    } else {
      setForm({
        id: '',
        possibilite: [],
        Pr: 0,
        Co: 0,
        Op: 0,
        Ad: 0,
        Ci: 0
      });
    }
  }, [editingItem]);

  const addPossibility = () => {
    if (newPossibility.trim() && !form.possibilite.includes(newPossibility)) {
      setForm({
        ...form,
        possibilite: [...form.possibilite, newPossibility.trim()]
      });
      setNewPossibility('');
    }
  };

  const removePossibility = (index) => {
    const updated = [...form.possibilite];
    updated.splice(index, 1);
    setForm({ ...form, possibilite: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiRequest(`/admin/ponderations/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        MySwal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Pondération mise à jour avec succès',
          showConfirmButton: false,
          timer: 1500,
          background: '#1f2937',
          color: '#fff'
        });
      } else {
        await apiRequest('/admin/ponderations', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        MySwal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Pondération créée avec succès',
          showConfirmButton: false,
          timer: 1500,
          background: '#1f2937',
          color: '#fff'
        });
      }
      setShowModal(false);
      reloadData();
    } catch (error) {
      console.error('Erreur création/modification pondération:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Une erreur est survenue',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
                {editingItem ? 'Modifier Pondération' : 'Nouvelle Pondération'}
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">ID</label>
                  <input
                    type="number"
                    value={form.id}
                    onChange={(e) => setForm({...form, id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Possibilités</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPossibility}
                      onChange={(e) => setNewPossibility(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="Ajouter une possibilité"
                    />
                    <button
                      type="button"
                      onClick={addPossibility}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {form.possibilite.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {form.possibilite.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded"
                        >
                          <span className="text-gray-300 text-sm">{item}</span>
                          <button
                            type="button"
                            onClick={() => removePossibility(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {['Pr', 'Co', 'Op', 'Ad', 'Ci'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{field}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form[field]}
                      onChange={(e) => setForm({...form, [field]: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  {editingItem ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PonderationModal;