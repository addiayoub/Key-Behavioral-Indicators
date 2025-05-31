import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const QuestionModal = ({ showModal, setShowModal, editingQuestion, reloadData, apiRequest, categories }) => {
  const [form, setForm] = useState({
    id: '',
    question: '',
    questionAng: '',
    required: false,
    answers: [''],
    answersAng: [''],
    Note: '',
    category: '',
    categoryAng: ''
  });
  const [activeTab, setActiveTab] = useState('fr');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    if (editingQuestion) {
      setForm({
        id: editingQuestion.id || '',
        question: editingQuestion.question || '',
        questionAng: editingQuestion.questionAng || '',
        required: editingQuestion.required || false,
        answers: editingQuestion.answers?.length > 0 ? [...editingQuestion.answers] : [''],
        answersAng: editingQuestion.answersAng?.length > 0 ? [...editingQuestion.answersAng] : [''],
        Note: editingQuestion.Note || '',
        category: editingQuestion.category || '',
        categoryAng: editingQuestion.categoryAng || ''
      });
    } else {
      setForm({
        id: '',
        question: '',
        questionAng: '',
        required: false,
        answers: [''],
        answersAng: [''],
        Note: '',
        category: '',
        categoryAng: ''
      });
    }
  }, [editingQuestion]);

  const handleAnswerChange = (index, value, lang = 'fr') => {
    const field = lang === 'fr' ? 'answers' : 'answersAng';
    const newAnswers = [...form[field]];
    newAnswers[index] = value;
    setForm({ ...form, [field]: newAnswers });
  };

  const addAnswer = (lang = 'fr') => {
    const field = lang === 'fr' ? 'answers' : 'answersAng';
    setForm({ ...form, [field]: [...form[field], ''] });
  };

  const removeAnswer = (index, lang = 'fr') => {
    const field = lang === 'fr' ? 'answers' : 'answersAng';
    const newAnswers = [...form[field]];
    newAnswers.splice(index, 1);
    setForm({ ...form, [field]: newAnswers.length > 0 ? newAnswers : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!form.id || !form.question || !form.category) {
        throw new Error('Les champs ID, Question et Catégorie sont obligatoires');
      }

      if (editingQuestion) {
        await apiRequest(`/admin/questions/${editingQuestion._id}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        MySwal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Question mise à jour avec succès',
          showConfirmButton: false,
          timer: 1500,
          background: '#1f2937',
          color: '#fff'
        });
      } else {
        await apiRequest('/admin/questions', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        MySwal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Question créée avec succès',
          showConfirmButton: false,
          timer: 1500,
          background: '#1f2937',
          color: '#fff'
        });
      }
      setShowModal(false);
      reloadData();
    } catch (error) {
      console.error('Erreur création/modification question:', error);
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
                {editingQuestion ? 'Modifier Question' : 'Nouvelle Question'}
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex justify-between items-center"
                    >
                      {form.category || 'Sélectionnez une catégorie'}
                      {showCategoryDropdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {showCategoryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {categories.map((cat) => (
                          <div
                            key={cat}
                            className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                            onClick={() => {
                              setForm({...form, category: cat});
                              setShowCategoryDropdown(false);
                            }}
                          >
                            {cat}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex border-b border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('fr')}
                  className={`px-4 py-2 font-medium ${activeTab === 'fr' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}
                >
                  Français
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 font-medium ${activeTab === 'en' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}
                >
                  Anglais
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {activeTab === 'fr' ? 'Question' : 'Question (English)'}
                </label>
                <input
                  type="text"
                  value={activeTab === 'fr' ? form.question : form.questionAng}
                  onChange={(e) => setForm({
                    ...form, 
                    [activeTab === 'fr' ? 'question' : 'questionAng']: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required={activeTab === 'fr'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {activeTab === 'fr' ? 'Réponses' : 'Answers'}
                </label>
                <div className="space-y-2">
                  {(activeTab === 'fr' ? form.answers : form.answersAng).map((answer, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value, activeTab)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeAnswer(index, activeTab)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg"
                      >
                        <Minus size={18} />
                      </button>
                    </motion.div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addAnswer(activeTab)}
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus size={18} />
                    {activeTab === 'fr' ? 'Ajouter une réponse' : 'Add answer'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Note</label>
                  <input
                    type="text"
                    value={form.Note}
                    onChange={(e) => setForm({...form, Note: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={form.required}
                    onChange={(e) => setForm({...form, required: e.target.checked})}
                    className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-300">
                    Question obligatoire
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  {editingQuestion ? 'Modifier' : 'Créer'}
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

export default QuestionModal;