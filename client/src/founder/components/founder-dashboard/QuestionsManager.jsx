import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import QuestionModal from './Modals/QuestionModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const QuestionsManager = ({ questions, apiRequest, reloadData }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Extraire les catégories uniques des questions
    const uniqueCategories = [...new Set(questions.map(q => q.category))];
    setCategories(uniqueCategories);
  }, [questions]);

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
        await apiRequest(`/admin/questions/${id}`, {
          method: 'DELETE'
        });
        reloadData();
        MySwal.fire({
          icon: 'success',
          title: 'Supprimé!',
          text: 'La question a été supprimée.',
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

  const openDetails = (question) => {
    MySwal.fire({
      title: `Détails Question #${question.id}`,
      html: `
        <div class="text-left text-gray-300">
          <div class="mb-4">
            <p class="text-sm text-gray-400">Catégorie:</p>
            <p class="font-medium">${question.category}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-400">Question (FR):</p>
              <p class="font-medium">${question.question}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Question (EN):</p>
              <p class="font-medium">${question.questionAng || '-'}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-400">Réponses (FR):</p>
              <ul class="list-disc pl-5">
                ${question.answers.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
            <div>
              <p class="text-sm text-gray-400">Answers (EN):</p>
              <ul class="list-disc pl-5">
                ${question.answersAng?.map(a => `<li>${a || '-'}</li>`).join('') || '-'}
              </ul>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-400">Note:</p>
              <p class="font-medium">${question.Note || '-'}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Obligatoire:</p>
              <p class="font-medium">${question.required ? 'Oui' : 'Non'}</p>
            </div>
          </div>
        </div>
      `,
      background: '#1f2937',
      color: '#fff',
      confirmButtonColor: '#f97316',
      width: '800px'
    });
  };

  const filteredQuestions = filterCategory 
    ? questions.filter(q => q.category === filterCategory)
    : questions;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Questions</h2>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {filterCategory || 'Toutes les catégories'}
              {showCategoryDropdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div
                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => {
                    setFilterCategory('');
                    setShowCategoryDropdown(false);
                  }}
                >
                  Toutes les catégories
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => {
                      setFilterCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingQuestion(null);
              setShowModal(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Question
          </motion.button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Question</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Réponses</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredQuestions.map((question) => (
              <motion.tr 
                key={question._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                className="text-gray-300"
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium">{question.id}</td>
                <td className="px-6 py-4">
                  <div className="line-clamp-2">{question.question}</div>
                {question.questionAng && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">{question.questionAng}</div>
                )}
                {question.required && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                    Obligatoire
                  </span>
                )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{question.category}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {question.answers.slice(0, 3).map((a, i) => (
                      <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs">
                        {a}
                      </span>
                    ))}
                    {question.answers.length > 3 && (
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                        +{question.answers.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openDetails(question)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Détails"
                    >
                      <Info size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingQuestion(question);
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
                      onClick={() => handleDelete(question._id)}
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

      <QuestionModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingQuestion={editingQuestion}
        reloadData={reloadData}
        apiRequest={apiRequest}
        categories={categories}
      />
    </div>
  );
};

export default QuestionsManager;