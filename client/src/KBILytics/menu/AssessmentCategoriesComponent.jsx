import React, { useState, useEffect } from 'react';
import General from '/Picture13.png';
import Proactivity from '/Picture14.png';
import Collaboration from '/Picture15.png';
import Openness from '/Picture16.png';
import Adaptability from '/Picture17.png';
import Continuous from '/Picture18.png';
import ApiService from './ApiService';
import Loader from "../../loader/Loader";
import { CircleCheckBig, CircleX, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const AssessmentCategoriesComponent = ({ language = 'fr' }) => {
  // États pour gérer les questions et les réponses
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allAnswers, setAllAnswers] = useState({}); // Stocke toutes les réponses par catégorie
  const [allOtherAnswers, setAllOtherAnswers] = useState({}); // Stocke toutes les réponses "autre" par catégorie
  const [showValidationIcons, setShowValidationIcons] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [direction, setDirection] = useState(1);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Custom SweetAlert configuration with transparent background
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

  // Accès aux réponses de la catégorie sélectionnée
  const answers = allAnswers[selectedCategory] || {};
  const otherAnswers = allOtherAnswers[selectedCategory] || {};

  // Catégories dans l'ordre d'affichage
  const categoriesFr = ['Basic', 'Proactivité : volonté de prendre des initiatives', "Collaboration : travail d'équipe efficace", 'Ouverture au feedback : réceptivité aux commentaires', 'Adaptability: Flexibility in change', "Amélioration continue : viser l'excellence"];
  const categoriesEn = ['Basic', 'Proactivity: Willingness to Take Initiative', 'Collaboration: Effective Teamwork', 'Openness to feedback: Receptiveness to Input', 'Adaptability: Flexibility in change', 'Citing continuous improvement: striving for excellence.'];
  
  const categories = language === 'fr' ? categoriesFr : categoriesEn;
  
  // Traductions
  const translations = {
    fr: {
      other: "Autre",
      pleaseSpecify: "Veuillez préciser...",
      enterAnswer: "Entrez votre réponse",
      questionsFor: "Questions pour",
      saveAnswers: "Enregistrer les réponses",
      submitAll: "Soumettre toutes les réponses",
      obligatoire: "* Questions obligatoires",
      expandAll: "Développer tout",
      collapseAll: "Réduire tout",
      introduction: "L'évaluation est composée de 6 sections. Environ 10 minutes seront nécessaires pour les compléter toutes",
      section1: "Section 1: 9 questions pour le filtrage et l'analyse croisée des données.",
      section2to6: "Section 2 à 6: 10 questions pour chaque catégorie.",
      categoryNames: {
        "General": "Generale",
        "Proactivity": "Proactivité",
        "Collaboration": "Collaboration",
        "Openness to Feedback": "Ouverture au feedback",
        "Adaptability": "Adaptabilité ",
        "Continuous Improvement": "Amélioration continue"
      },
      submissionSuccess: "Toutes vos réponses ont été soumises avec succès!",
      submissionError: "Une erreur est survenue lors de la soumission. Veuillez réessayer.",
      missingAnswers: "Veuillez répondre à toutes les questions obligatoires avant de soumettre.",
      checkAnswers: "Vérifier les réponses",
      answersValid: "Toutes les réponses sont valides pour cette catégorie",
      keyBehavioral: "Évaluation des comportements clés",
      estimatedTime: "Temps estimé : 10 minutes",
      changeReadiness: "Évaluation de la préparation au changement",
      invitedMessage: "Vous avez été invité à participer à cette évaluation pour mesurer votre préparation au changement.",
      invitedMessage1: "Vos réponses resteront anonymes et seront utilisées uniquement à des fins d'analyse globale.",
      invitedMessage2: "Merci pour votre participation!",
      startNow: "Démarrer maintenant",
      previous: "Précédent",
      next: "Suivant",
      submit: "Soumettre",
      incompleteForm: "Formulaire incomplet",
      answerAllQuestions: "Veuillez répondre à toutes les questions obligatoires avant de continuer.",
      missingQuestions: "Questions manquantes:",
      understood: "Compris",
      success: "Succès!",
      answersSubmitted: "Vos réponses ont été soumises avec succès!",
      yourResults: "Vos résultats",
      yourTotalScore: "Votre score total:",
      percentage: "Pourcentage:",
      categoryScores: "Scores par catégorie:",
      completed: "% complété",
      error: "Erreur"
    },
    en: {
      other: "Other",
      pleaseSpecify: "Please specify...",
      enterAnswer: "Enter your answer",
      questionsFor: "Questions for",
      saveAnswers: "Save Answers",
      submitAll: "Submit All Answers",
      obligatoire: "* Required questions",
      expandAll: "Expand all",
      collapseAll: "Collapse all",
      introduction: "The assessment is composed of 6 sections. Around 10min will be needed to complete them all",
      section1: "Section 1: 9 questions for filtering and cross analysis of data.",
      section2to6: "Section 2 to 6: 10 questions for each category.",
      categoryNames: {
        "General": "General",
        "Proactivity": "Proactivity",
        "Collaboration": "Collaboration",
        "Openness to Feedback": "Openness to feedback",
        "Adaptability": "Adaptability",
        "Continuous Improvement": "Continuous Improvement"
      },
      submissionSuccess: "All your answers have been successfully submitted!",
      submissionError: "An error occurred while submitting. Please try again.",
      missingAnswers: "Please answer all required questions before submitting.",
      checkAnswers: "Check Answers",
      answersValid: "All answers are valid for this category",
      keyBehavioral: "Key Behavioral Assessment",
      estimatedTime: "Estimated time: 10 minutes",
      changeReadiness: "Change Readiness Assessment",
      invitedMessage: "You have been invited to participate in this assessment to measure your change readiness.",
      invitedMessage1: "Your responses will remain anonymous and will be used only for overall analysis purposes.",
      invitedMessage2: "Thank you for your participation!",
      startNow: "Start Now",
      previous: "Previous",
      next: "Next",
      submit: "Submit",
      incompleteForm: "Incomplete Form",
      answerAllQuestions: "Please answer all required questions before continuing.",
      missingQuestions: "Missing questions:",
      understood: "Understood",
      success: "Success!",
      answersSubmitted: "Your answers have been successfully submitted!",
      yourResults: "Your Results",
      yourTotalScore: "Your total score:",
      percentage: "Percentage:",
      categoryScores: "Category scores:",
      completed: "% completed",
      error: "Error"
    }
  };
  
  const t = translations[language] || translations.fr;
  
  const categoryMapping = language === 'fr' ? {
    "General": 'Basic',
    "Proactivity": 'Proactivité : volonté de prendre des initiatives',
    "Collaboration": 'Collaboration : travail d\'équipe efficace',
    "Openness to Feedback": 'Ouverture au feedback : réceptivité aux commentaires',
    "Adaptability": 'Adaptability: Flexibility in change',
    "Continuous Improvement": 'Amélioration continue : viser l\'excellence'
  } : {
    "General": 'Basic',
    "Proactivity": 'Proactivity: Willingness to Take Initiative',
    "Collaboration": 'Collaboration: Effective Teamwork',
    "Openness to Feedback": 'Openness to feedback: Receptiveness to Input',
    "Adaptability": 'Adaptability: Flexibility in change',
    "Continuous Improvement":'Citing continuous improvement: striving for excellence.'
  };

  const categoryItems = [
    { 
      name: "General", 
      displayName: t.categoryNames["General"],
      iconPath: General,
      delay: 0.1 
    },
    { 
      name: "Proactivity", 
      displayName: t.categoryNames["Proactivity"],
      iconPath: Proactivity,
      delay: 0.3
    },
    { 
      name: "Collaboration", 
      displayName: t.categoryNames["Collaboration"],
      iconPath: Collaboration,
      delay: 0.5
    },
    { 
      name: "Openness to Feedback", 
      displayName: t.categoryNames["Openness to Feedback"],
      iconPath: Openness,
      delay: 0.7
    },
    { 
      name: "Adaptability", 
      displayName: t.categoryNames["Adaptability"],
      iconPath: Adaptability,
      delay: 0.9
    },
    { 
      name: "Continuous Improvement", 
      displayName: t.categoryNames["Continuous Improvement"],
      iconPath: Continuous,
      delay: 1.0
    }
  ];

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (selectedCategory && isFormDirty) {
        const message = language === 'fr' 
          ? 'Vous allez perdre toutes vos réponses si vous quittez cette page. Êtes-vous sûr de vouloir continuer ?'
          : 'You will lose all your answers if you leave this page. Are you sure you want to continue?';
        
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedCategory, isFormDirty, language]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 116 && selectedCategory && isFormDirty) {
        e.preventDefault();
        showRefreshWarning();
      }
    };

    const showRefreshWarning = () => {
      customSwal.fire({
        title: language === 'fr' ? 'Attention !' : 'Warning!',
        text: language === 'fr' 
          ? 'Vous allez perdre toutes vos réponses si vous quittez cette page. Êtes-vous sûr de vouloir continuer ?'
          : 'You will lose all your answers if you leave this page. Are you sure you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: language === 'fr' ? 'Oui, quitter' : 'Yes, leave',
        cancelButtonText: language === 'fr' ? 'Non, rester' : 'No, stay'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCategory, isFormDirty, language]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          const categoryName = categoryMapping[selectedCategory] || selectedCategory;
          const data = await ApiService.getQuestionsByCategory(categoryName);
          setQuestions(data);
        } catch (error) {
          console.error('Erreur lors du chargement des questions:', error);
          customSwal.fire({
            title: t.error,
            text: 'Failed to load questions. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [selectedCategory, language]);

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

  const handleSaveAnswers = () => {
    setShowValidationIcons(true);
    const missingRequiredQuestions = getMissingRequiredQuestions();
    
    if (missingRequiredQuestions.length === 0) {
      console.log("Réponses sauvegardées pour", selectedCategory, answers, otherAnswers);
      customSwal.fire({
        title: t.success,
        text: language === 'fr' 
          ? "Vos réponses ont été enregistrées avec succès!" 
          : "Your answers have been successfully saved!",
        icon: 'success',
        confirmButtonText: 'OK'
      });
      setShowValidationIcons(false);
    } else {
      setExpandedQuestion(missingRequiredQuestions[0]);
      const firstMissingQuestionId = missingRequiredQuestions[0];
      const element = document.getElementById(`question-${firstMissingQuestionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
    const allCategoriesValid = categoryItems.every(category => {
      const categoryAnswers = allAnswers[category.name] || {};
      const categoryQuestions = questions.filter(q => q.category === categoryMapping[category.name]);
      
      return categoryQuestions.every(q => {
        if (!q.required) return true;
        return !!categoryAnswers[q.id];
      });
    });

    if (!allCategoriesValid) {
      customSwal.fire({
        title: t.incompleteForm,
        text: t.missingAnswers,
        icon: 'error',
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
      }).then(async () => {
        try {
          const results = await ApiService.getUserResults();
          const totalScore = results.totalScore;
          const percentage = totalScore.maxPossible > 0 
            ? Math.round((totalScore.score / totalScore.maxPossible) * 100) 
            : 0;
          
          customSwal.fire({
            title: t.yourResults,
            html: `
              <p>${t.yourTotalScore} ${totalScore.score}/${totalScore.maxPossible}</p>
              <p>${t.percentage} ${percentage}%</p>
              <h3>${t.categoryScores}</h3>
              <ul>
                ${results.categoryScores
                  .filter(cat => cat.category !== 'Basic')
                  .map(cat => 
                    `<li>${cat.category}: ${cat.rawScore}/${cat.maxPossible} (${Math.round((cat.rawScore/cat.maxPossible)*100)}%)</li>`
                  ).join('')}
              </ul>
            `,
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } catch (e) {
          console.error('Error retrieving results:', e);
        }
      });
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

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const expandAllQuestions = () => {
    setExpandedQuestion('all');
  };

  const collapseAllQuestions = () => {
    setExpandedQuestion(null);
  };

  const isTextInputQuestion = (question) => {
    return question && question.answers && question.answers.length === 0;
  };

  const isOtherOptionSelected = (questionId) => {
    return answers[questionId] === t.other;
  };

  const isQuestionAnswered = (questionId) => {
    return !!answers[questionId];
  };

  const getMissingRequiredQuestions = () => {
    return questions
      .filter(q => q.required && !answers[q.id])
      .map(q => q.id);
  };

  const getQuestionText = (question) => {
    return language === 'fr' ? question.question : (question.questionAng || question.question);
  };

  const getAnswersForLanguage = (question) => {
    return language === 'fr' ? question.answers : (question.answersAng || question.answers);
  };

  const isQuestionExpanded = (questionId) => {
    return expandedQuestion === 'all' || expandedQuestion === questionId;
  };

  const checkCategoryAnswers = () => {
    const missingRequiredQuestions = getMissingRequiredQuestions();
    
    if (missingRequiredQuestions.length === 0) {
      customSwal.fire({
        title: t.success,
        text: t.answersValid,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      customSwal.fire({
        title: t.incompleteForm,
        html: `
          <p>${t.answerAllQuestions}</p>
          <p>${missingRequiredQuestions.length} ${language === 'fr' ? 'questions obligatoires manquantes' : 'required questions missing'}</p>
        `,
        icon: 'error',
        confirmButtonText: t.understood
      });
      setExpandedQuestion(missingRequiredQuestions[0]);
      const firstMissingQuestionId = missingRequiredQuestions[0];
      const element = document.getElementById(`question-${firstMissingQuestionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const questionVariants = {
    hidden: { opacity: 0, x: 50 * direction },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: -50 * direction,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const getQuestionsForTitle = () => {
    if (!selectedCategory) return '';
    return `${t.questionsFor} ${t.categoryNames[selectedCategory] || selectedCategory}`;
  };

  return (
    <div className="text-white">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg text-white mb-2">{t.introduction}</p>
        <p className="text-lg text-white mb-2">{t.section1}</p>
        <p className="text-lg text-white mb-2">{t.section2to6}</p>
      </motion.div>
      
      <div className="flex flex-col">
        <motion.div 
          className="border border-white rounded-3xl p-6 mt-4 bg- bg-opacity-60"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
            {categoryItems.map((category, index) => (
              <motion.div 
                key={index} 
                className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 
                  w-full h-32 rounded-xl hover:shadow-lg hover:shadow-orange-400/20 ${selectedCategory === category.name 
                  ? 'bg-gradient-to-br from-orange-600 to-orange-800 scale-105 shadow-md shadow-orange-500/30' 
                  : 'bg-black-800 hover:bg-orange-900'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className={`mb-2 ${selectedCategory === category.name ? 'text-white' : 'text-orange-500'}`}>
                  <img 
                    src={category.iconPath} 
                    alt={category.name} 
                    className="w-14 h-14" 
                  />
                </div>
                <span className="text-white text-center font-medium px-1">{category.displayName}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {loading ? (
        <motion.div 
          className="mt-8 flex justify-center p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader />
        </motion.div>
      ) : selectedCategory && questions.length > 0 ? (
        <motion.div 
          className="mt-8 max-w-4xl mx-auto"
          key={selectedCategory}
          initial={{ opacity: 0, x: 100 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 * direction }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div 
            className="bg-gradient-to-r from- to-orange-800 rounded-t-xl p-6 border-b border-orange-500 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold">{t.questionsFor} {selectedCategory}</h3>
            <div className="flex space-x-4 items-center">
              <motion.button 
                onClick={expandAllQuestions}
                className="text-sm text-orange-400 hover:text-orange-500 cursor-pointer transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronDown size={16} className="mr-1" /> {t.expandAll}
              </motion.button>
              <motion.button 
                onClick={collapseAllQuestions}
                className="text-sm text-orange-400 hover:text-orange-300 cursor-pointer transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronUp size={16} className="mr-1" /> {t.collapseAll}
              </motion.button>
              <motion.button 
                onClick={checkCategoryAnswers}
                className="text-sm text-green-400 hover:text-green-300 cursor-pointer transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CircleCheckBig size={16} className="mr-1" /> {t.checkAnswers}
              </motion.button>
              <span className="text-orange-500 text-sm">{t.obligatoire}</span>
            </div>
          </motion.div>
          
          <div className="bg- bg-opacity-90 rounded-b-xl shadow-xl flex flex-col">
            <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: "60vh" }}>
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {questions.slice(0, selectedCategory === 'General' ? 9 : 10).map((q, index) => (
                  <motion.div 
                    key={q._id || index} 
                    id={`question-${q.id}`}
                    className={`rounded-lg transition-all duration-300 border ${
                      showValidationIcons && q.required && !isQuestionAnswered(q.id)
                        ? 'border-red-500'
                        : 'border-white-400'
                    }`}
                    variants={questionVariants}
                    layout
                  >
                    <motion.div 
                      className={`p-4 rounded-lg cursor-pointer flex items-start justify-between ${
                        isQuestionExpanded(q.id) ? 'bg-gray-800' : 'hover:bg-orange-800'
                      }`}
                      onClick={() => toggleQuestion(q.id)}
                      whileHover={{ scale: 1.005 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
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
                        <motion.div 
                          className="p-4 pt-2 bg-gray-800 rounded-b-lg border-t border-gray-700"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="space-y-3 ml-11">
                            {isTextInputQuestion(q) ? (
                              <motion.div className="flex items-center">
                                <input
                                  type="text"
                                  id={`q${q.id}`}
                                  name={`question_${q.id}`}
                                  value={answers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className={`w-full p-3 rounded bg-gray-700 text-white border ${
                                    showValidationIcons && q.required && !answers[q.id]
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
                                  <motion.div 
                                    key={i} 
                                    className="flex items-center"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <input
                                      type="radio"
                                      id={`q${q.id}_${i}`}
                                      name={`question_${q.id}`}
                                      value={answer}
                                      checked={answers[q.id] === answer}
                                      onChange={() => handleAnswerChange(q.id, answer)}
                                      className={`mr-3 h-5 w-5 text-orange-500 focus:ring-orange-500 ${
                                        showValidationIcons && q.required && !answers[q.id]
                                          ? 'ring-2 ring-red-500'
                                          : ''
                                      }`}
                                      required={q.required}
                                    />
                                    <label 
                                      htmlFor={`q${q.id}_${i}`} 
                                      className="text-white cursor-pointer hover:text-orange-300 transition-colors"
                                    >
                                      {answer}
                                    </label>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                            
                            {isOtherOptionSelected(q.id) && (
                              <motion.div 
                                className="mt-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <input
                                  type="text"
                                  id={`q${q.id}_other`}
                                  name={`question_${q.id}_other`}
                                  value={otherAnswers[q.id] || ''}
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

            <motion.div 
              className="flex justify-between p-6 pt-4 bg- border-t border-gray-800 rounded-b-xl sticky bottom-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <motion.button
                onClick={handleSaveAnswers}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 cursor-pointer font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.saveAnswers}
              </motion.button>
              
              <motion.button
                onClick={handleSubmitAllAnswers}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg hover:from-green-700 hover:to-green-900 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 cursor-pointer font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.submitAll}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}

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