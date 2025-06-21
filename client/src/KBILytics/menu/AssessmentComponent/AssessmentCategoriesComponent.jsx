import React, { useState, useEffect } from 'react';
import ApiService from '../ApiService';
import Loader from "../../../loader/Loader";
import { CircleCheckBig, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { Translations } from '../../../Language/datalang';

const AssessmentCategoriesComponent = ({ language = 'fr', onReturnToMenu }) => {
  // États pour gérer les questions et les réponses
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allAnswers, setAllAnswers] = useState({});
  const [allOtherAnswers, setAllOtherAnswers] = useState({});
  const [showValidationIcons, setShowValidationIcons] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [direction, setDirection] = useState(1);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);

  // Custom SweetAlert configuration
  const customSwal = Swal.mixin({
    background: 'transparent',
    backdrop: 'rgba(0,0,0,0.4)',
    color: '#fff',
    customClass: {
      popup: 'swal-transparent-popup',
      title: 'swal-transparent-title',
      htmlContainer: 'swal-transparent-content',
      confirmButton: 'swal-transparent-confirm',
      cancelButton: 'swal-transparent-cancel'
    },
    confirmButtonColor: '#FF3D00',
    cancelButtonColor: 'rgba(60, 60, 60, 0.7)'
  });

  const t = Translations[language] || Translations.fr;

  // Charger les catégories depuis l'API
useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await ApiService.getAllCategories();
        
        // Transformer les données de l'API en format utilisable par le composant
        const formattedCategories = response.map(cat => ({
          id: cat._id,
          name: cat.nom.fr, // Utiliser le nom français comme clé
          displayName: language === 'fr' ? cat.nom.fr : cat.nom.en || cat.nom.fr, // Fallback to French if English name is missing
          iconPath: cat.icon,
          delay: 0.1 * (response.indexOf(cat) + 1)
        }));
        
        setCategories(response); // Stocker les données brutes de l'API
        setCategoryItems(formattedCategories);
        
        // Sélectionner automatiquement la première catégorie si aucune n'est sélectionnée
        if (!selectedCategory && formattedCategories.length > 0) {
          handleCategoryClick(formattedCategories[0].name);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        customSwal.fire({
          title: t.error,
          text: t.loadCategoriesError,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [language]);

  // Gestion des questions lorsque la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          // Trouver la catégorie correspondante dans les données brutes
          const categoryData = categories.find(cat => 
            cat.nom.fr === selectedCategory || cat.nom.en === selectedCategory
          );
          
          if (categoryData) {
            const data = await ApiService.getQuestionsByCategory(
              language === 'fr' ? categoryData.nom.fr : categoryData.nom.en
            );
            
            // Trier les questions par ID
            const sortedData = [...data].sort((a, b) => a.id - b.id);
            setQuestions(sortedData);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des questions:', error);
          customSwal.fire({
            title: t.error,
            text: t.loadQuestionsError,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setLoading(false);
        }
      };
  
      fetchQuestions();
    }
  }, [selectedCategory, language, categories]);

  // Gestion des événements avant déchargement de la page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (selectedCategory && isFormDirty) {
        const message = t.leavePageWarning;
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedCategory, isFormDirty, t]);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 116 && selectedCategory && isFormDirty) {
        e.preventDefault();
        showRefreshWarning();
      }
    };

    const showRefreshWarning = () => {
      customSwal.fire({
        title: t.warning,
        text: t.leavePageWarning,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t.yesLeave,
        cancelButtonText: t.noStay
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategory, isFormDirty, t]);

  const handleCategoryClick = (categoryName) => {
    const currentIndex = categoryItems.findIndex(item => item.name === selectedCategory);
    const newIndex = categoryItems.findIndex(item => item.name === categoryName);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedCategory(categoryName);
    setShowValidationIcons(false);
    setExpandedQuestion(null);
  };

  const handleAnswerChange = (questionId, value) => {
    setIsFormDirty(true);
    setAllAnswers(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [questionId]: value
      }
    }));
    
    if (value !== t.other) {
      setAllOtherAnswers(prev => {
        const newOtherAnswers = { ...prev };
        if (newOtherAnswers[selectedCategory]) {
          delete newOtherAnswers[selectedCategory][questionId];
        }
        return newOtherAnswers;
      });
    }
  };

  const handleOtherInputChange = (questionId, value) => {
    setIsFormDirty(true);
    setAllOtherAnswers(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [questionId]: value
      }
    }));
  };

  const getMissingRequiredQuestions = () => {
    return questions
      .filter(q => q.required && !allAnswers[selectedCategory]?.[q.id])
      .map(q => q.id);
  };

  const handleSaveAnswers = () => {
    setShowValidationIcons(true);
    const missingRequiredQuestions = getMissingRequiredQuestions();
    
    if (missingRequiredQuestions.length === 0) {
      customSwal.fire({
        title: t.success,
        text: t.saveSuccess,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      setShowValidationIcons(false);
    } else {
      setExpandedQuestion(missingRequiredQuestions[0]);
      const firstMissingQuestionId = missingRequiredQuestions[0];
      const element = document.getElementById(`question-${firstMissingQuestionId}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      customSwal.fire({
        title: t.incompleteForm,
        html: `
          <p>${t.answerAllQuestions}</p>
          <p>${t.missingQuestions} ${missingRequiredQuestions.join(', ')}</p>
        `,
        icon: 'error',
        confirmButtonText: t.understood
      });
    }
  };

 const handleSubmitAllAnswers = async () => {
    // Vérifier que toutes les catégories sont complètes
    const incompleteCategories = [];
    
    for (const category of categoryItems) {
      // Récupérer les questions de la catégorie
      let categoryQuestions;
      try {
        categoryQuestions = await ApiService.getQuestionsByCategory(
          language === 'fr' ? category.name : categories.find(cat => cat.nom.fr === category.name)?.nom.en || category.name
        );
      } catch (error) {
        console.error(`Erreur lors de la récupération des questions pour la catégorie ${category.displayName}:`, error);
        continue;
      }

      const categoryAnswers = allAnswers[category.name] || {};
      
      // Vérifier les questions obligatoires non répondues
      const unansweredRequiredQuestions = categoryQuestions.filter(q => 
        q.required && !categoryAnswers[q.id]
      );
      
      if (unansweredRequiredQuestions.length > 0) {
        incompleteCategories.push({
          displayName: category.displayName,
          missingQuestions: unansweredRequiredQuestions.map(q => q.id)
        });
      }
    }
    
    if (incompleteCategories.length > 0) {
      const errorMessage = `
        <p>${t.incompleteCategories}</p>
        <ul>
          ${incompleteCategories.map(cat => `
            <li>${cat.displayName}: ${t.missingQuestions} ${cat.missingQuestions.join(', ')}</li>
          `).join('')}
        </ul>
        <p>${t.completeAllRequired}</p>
      `;
      
      customSwal.fire({
        title: t.incompleteForm,
        html: errorMessage,
        icon: 'warning',
        confirmButtonText: t.understood
      });
      return;
    }

    try {
      setLoading(true);
      const allResponses = [];
      
      for (const category of categoryItems) {
        const categoryAnswers = allAnswers[category.name] || {};
        const categoryOtherAnswers = allOtherAnswers[category.name] || {};
        
        for (const [questionId, answerValue] of Object.entries(categoryAnswers)) {
          allResponses.push({
            category: category.name,
            questionId: parseInt(questionId),
            answerValue,
            otherValue: categoryOtherAnswers[questionId] || null
          });
        }
      }

      const result = await ApiService.submitAllAnswers(allResponses);
      setSubmissionStatus('success');
      setIsFormDirty(false);
      
      customSwal.fire({
        title: t.success,
        text: t.submissionSuccess,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => onReturnToMenu());
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmissionStatus('error');
      customSwal.fire({
        title: t.error,
        text: t.submissionError,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };
  const goToNextCategory = () => {
    const currentIndex = categoryItems.findIndex(item => item.name === selectedCategory);
    if (currentIndex < categoryItems.length - 1) {
      setDirection(1);
      handleCategoryClick(categoryItems[currentIndex + 1].name);
    }
  };

  const goToPreviousCategory = () => {
    const currentIndex = categoryItems.findIndex(item => item.name === selectedCategory);
    if (currentIndex > 0) {
      setDirection(-1);
      handleCategoryClick(categoryItems[currentIndex - 1].name);
    }
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const expandAllQuestions = () => setExpandedQuestion('all');
  const collapseAllQuestions = () => setExpandedQuestion(null);

  const isTextInputQuestion = (question) => !question.answers || question.answers.length === 0;
  const isOtherOptionSelected = (questionId) => allAnswers[selectedCategory]?.[questionId] === t.other;
  const isQuestionAnswered = (questionId) => !!allAnswers[selectedCategory]?.[questionId];
  const isQuestionExpanded = (questionId) => expandedQuestion === 'all' || expandedQuestion === questionId;

  const getQuestionText = (question) => (
    language === 'fr' ? question.question : (question.questionAng || question.question)
  );

  const getAnswersForLanguage = (question) => (
    language === 'fr' ? question.answers : (question.answersAng || question.answers)
  );

// Remplacez la fonction getCategoryCompletionPercentage existante par celle-ci :

const getCategoryCompletionPercentage = (categoryName) => {
  // Pour la catégorie actuellement sélectionnée, utiliser les questions chargées
  if (categoryName === selectedCategory && questions.length > 0) {
    const categoryAnswers = allAnswers[categoryName] || {};
    const answeredCount = questions.filter(q => !!categoryAnswers[q.id]).length;
    return Math.round((answeredCount / questions.length) * 100);
  }
  
  // Pour les autres catégories, vérifier s'il y a des réponses sauvegardées
  const categoryAnswers = allAnswers[categoryName] || {};
  const answeredCount = Object.keys(categoryAnswers).length;
  
  // Si aucune réponse n'est sauvegardée, retourner 0
  if (answeredCount === 0) {
    return 0;
  }
  
  // Vous pouvez aussi essayer de récupérer le nombre total de questions 
  // depuis l'API si nécessaire, mais pour l'instant on utilise les réponses existantes
  return answeredCount > 0 ? Math.min(100, (answeredCount / 10) * 100) : 0; // Estimation
};

  const questionVariants = {
    hidden: { opacity: 0, x: 50 * direction },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -50 * direction,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, when: "beforeChildren" }
    }
  };

  return (
    <div className="text-white">
      <motion.div className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <p className="text-lg text-white mb-2">{t.introduction}</p>
        <p className="text-lg text-white mb-2">{t.section1}</p>
        <p className="text-lg text-white mb-2">{t.section2to6}</p>
      </motion.div>
      
      {loading && !categoryItems.length ? (
        <div className="flex justify-center p-12">
          <Loader />
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <motion.div className="border border-white rounded-3xl p-6 mt-4 bg- bg-opacity-60"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
                {categoryItems.map((category, index) => (
                  <motion.div key={index} 
                    className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 
                      w-full h-32 rounded-xl hover:shadow-lg hover:shadow-orange-400/20 ${selectedCategory === category.name 
                      ? 'bg-gradient-to-br from-orange-600 to-orange-800 scale-105 shadow-md shadow-orange-500/30' 
                      : 'bg-black-800 hover:bg-orange-900'}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(category.name)}>
                    <div className={`mb-2 ${selectedCategory === category.name ? 'text-white' : 'text-orange-500'}`}>
                     {category.iconPath ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL || ''}${category.iconPath}`} 
                        alt={category.name} 
                        className="w-14 h-14 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ''; // Optionnel: chemin vers une image par défaut
                          e.target.parentElement.innerHTML = `
                            <div class="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                              <span class="text-xs text-center">${category.name.charAt(0)}</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs text-center">{category.name.charAt(0)}</span>
                      </div>
                    )}
                    </div>
                    <span className="text-white text-center font-medium px-1 text-xs">{category.displayName}</span>
                    
                    <div className="w-3/4 h-1 bg-gray-700 rounded-full mt-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${getCategoryCompletionPercentage(category.name)}%` }} />
                    </div>
                    <span className="text-xs text-gray-300 mt-1">
                      {getCategoryCompletionPercentage(category.name)} {t.completed}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {selectedCategory && questions.length > 0 && (
            <motion.div className="mt-8 max-w-4xl mx-auto"
              key={selectedCategory}
              initial={{ opacity: 0, x: 100 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 * direction }}
              transition={{ duration: 0.5, ease: "easeInOut" }}>
              <motion.div className="bg-gradient-to-r from- to-orange-800 rounded-t-xl p-6 border-b border-orange-500 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}>
                <h3 className="text-2xl font-bold">{t.questionsFor} {categoryItems.find(c => c.name === selectedCategory)?.displayName || selectedCategory}</h3>
                <div className="flex space-x-4 items-center">
                  <motion.button onClick={expandAllQuestions}
                    className="text-sm text-orange-400 hover:text-orange-500 cursor-pointer transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <ChevronDown size={16} className="mr-1" /> {t.expandAll}
                  </motion.button>
                  <motion.button onClick={collapseAllQuestions}
                    className="text-sm text-orange-400 hover:text-orange-300 cursor-pointer transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <ChevronUp size={16} className="mr-1" /> {t.collapseAll}
                  </motion.button>
                  <motion.button onClick={() => {
                    setShowValidationIcons(true);
                    const missing = getMissingRequiredQuestions();
                    if (missing.length === 0) {
                      customSwal.fire({
                        title: t.success,
                        text: t.answersValid,
                        icon: 'success',
                        confirmButtonText: 'OK'
                      });
                    } else {
                      customSwal.fire({
                        title: t.incompleteForm,
                        html: `<p>${t.answerAllQuestions}</p><p>${missing.length} ${t.requiredQuestionsMissing}</p>`,
                        icon: 'error',
                        confirmButtonText: t.understood
                      });
                      setExpandedQuestion(missing[0]);
                    }
                  }}
                    className="text-sm text-green-400 hover:text-green-300 cursor-pointer transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <CircleCheckBig size={16} className="mr-1" /> {t.checkAnswers}
                  </motion.button>
                  <span className="text-orange-500 text-sm">{t.obligatoire}</span>
                </div>
              </motion.div>
              
              <div className="bg- bg-opacity-90 rounded-b-xl shadow-xl flex flex-col">
                <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: "60vh" }}>
                  <motion.div className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible">
                    {questions.map((q, index) => (
                      <motion.div key={q._id || index} 
                        id={`question-${q.id}`}
                        className={`rounded-lg transition-all duration-300 border ${
                          showValidationIcons && q.required && !isQuestionAnswered(q.id)
                            ? 'border-red-500'
                            : 'border-white-400'
                        }`}
                        variants={questionVariants}
                        layout>
                        <motion.div className={`p-4 rounded-lg cursor-pointer flex items-start justify-between ${
                            isQuestionExpanded(q.id) ? 'bg-gray-800' : 'hover:bg-orange-800'
                          }`}
                          onClick={() => toggleQuestion(q.id)}
                          whileHover={{ scale: 1.005 }}
                          transition={{ type: "spring", stiffness: 300 }}>
                          <div className="flex items-center flex-grow">
                            <div className={`mr-3 h-8 w-8 flex items-center justify-center rounded-full ${
                              isQuestionAnswered(q.id) ? 'bg-green-600' : 'bg-gray-700'
                            }`}>
                              {isQuestionAnswered(q.id) ? (
                                <CircleCheckBig size={20} className="text-white" />
                              ) : (
                                <span className="text-white font-medium">{q.id}</span>
                              )}
                            </div>
                            <p className="text-lg font-medium line-clamp-2">
                              {getQuestionText(q)} {q.required && <span className="text-red-500">*</span>}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex items-center">
                            {isQuestionExpanded(q.id) ? (
                              <ChevronUp size={20} className="text-orange-500" />
                            ) : (
                              <ChevronDown size={20} className="text-orange-500" />
                            )}
                          </div>
                        </motion.div>
                        
                        <AnimatePresence>
                          {isQuestionExpanded(q.id) && (
                            <motion.div className="p-4 pt-2 bg-gray-800 rounded-b-lg border-t border-gray-700"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}>
                              <div className="space-y-3 ml-11">
                                {isTextInputQuestion(q) ? (
                                  <motion.div className="flex items-center">
                                    <input
                                      type="text"
                                      id={`q${q.id}`}
                                      name={`question_${q.id}`}
                                      value={allAnswers[selectedCategory]?.[q.id] || ''}
                                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                      className={`w-full p-3 rounded bg-gray-700 text-white border ${
                                        showValidationIcons && q.required && !allAnswers[selectedCategory]?.[q.id]
                                          ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                          : 'border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                                      } outline-none transition-all`}
                                      required={q.required}
                                      placeholder={t.enterAnswer}
                                    />
                                  </motion.div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {getAnswersForLanguage(q).map((answer, i) => (
                                      <motion.div key={i} 
                                        className="flex items-center"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}>
                                        <input
                                          type="radio"
                                          id={`q${q.id}_${i}`}
                                          name={`question_${q.id}`}
                                          value={answer}
                                          checked={allAnswers[selectedCategory]?.[q.id] === answer}
                                          onChange={() => handleAnswerChange(q.id, answer)}
                                          className={`mr-3 h-5 w-5 text-orange-500 focus:ring-orange-500 ${
                                            showValidationIcons && q.required && !allAnswers[selectedCategory]?.[q.id]
                                              ? 'ring-2 ring-red-500'
                                              : ''
                                          }`}
                                          required={q.required}
                                        />
                                        <label htmlFor={`q${q.id}_${i}`} 
                                          className="text-white cursor-pointer hover:text-orange-300 transition-colors">
                                          {answer}
                                        </label>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                                
                                {isOtherOptionSelected(q.id) && (
                                  <motion.div className="mt-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}>
                                    <input
                                      type="text"
                                      id={`q${q.id}_other`}
                                      name={`question_${q.id}_other`}
                                      value={allOtherAnswers[selectedCategory]?.[q.id] || ''}
                                      onChange={(e) => handleOtherInputChange(q.id, e.target.value)}
                                      className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                      placeholder={t.pleaseSpecify}
                                      required={q.required}
                                    />
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <motion.div className="flex justify-between p-6 pt-4 bg- border-t border-gray-800 rounded-b-xl sticky bottom-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}>
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={goToPreviousCategory}
                      className={`px-4 py-2 bg-gray-700 text-white rounded-lg transition-all hover:bg-gray-600 flex items-center
                        ${categoryItems.findIndex(item => item.name === selectedCategory) === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={categoryItems.findIndex(item => item.name === selectedCategory) === 0}>
                      <ChevronLeft className="mr-2" size={18} />
                    </motion.button>
                    
                    <motion.button
                      onClick={handleSaveAnswers}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 cursor-pointer font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      {getCategoryCompletionPercentage(selectedCategory) === 100 ? t.saveAndContinue : t.saveAnswers}
                    </motion.button>
                    
                    <motion.button
                      onClick={goToNextCategory}
                      className={`px-4 py-2 bg-gray-700 text-white rounded-lg transition-all hover:bg-gray-600 cursor-pointer flex items-center
                        ${categoryItems.findIndex(item => item.name === selectedCategory) === categoryItems.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={categoryItems.findIndex(item => item.name === selectedCategory) === categoryItems.length - 1}>
                      <ChevronRight className="ml-2" size={18} />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    onClick={handleSubmitAllAnswers}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg hover:from-green-700 hover:to-green-900 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 cursor-pointer font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    {t.submitAll}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a202c;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ed8936;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #dd6b20;
        }
        input[type="radio"] {
          appearance: none;
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid #4a5568;
          border-radius: 50%;
          outline: none;
          cursor: pointer;
        }
        input[type="radio"]:checked {
          border: 2px solid #ed8936;
          background-color: #ed8936;
          box-shadow: 0 0 0 2px #000 inset;
        }
        input[type="radio"]:focus {
          box-shadow: 0 0 0 3px rgba(237, 137, 54, 0.5);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AssessmentCategoriesComponent;
