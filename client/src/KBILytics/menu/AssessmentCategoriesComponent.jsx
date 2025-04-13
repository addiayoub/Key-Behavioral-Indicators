// import React, { useState, useEffect } from 'react';
// import General from '/Picture13.png';
// import Proactivity from '/Picture14.png';
// import Collaboration from '/Picture15.png';
// import Openness from '/Picture16.png';
// import Adaptability from '/Picture17.png';
// import Continuous from '/Picture18.png';
// import ApiService from './ApiService';
// import Loader from "../../loader/Loader";
// import { CircleCheckBig, CircleX, ChevronDown, ChevronUp } from 'lucide-react';

// const AssessmentCategoriesComponent = () => {
//   // États pour gérer les questions et les réponses
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [language, setLanguage] = useState('fr');
//   const [showValidationIcons, setShowValidationIcons] = useState(false);
//   const [expandedQuestion, setExpandedQuestion] = useState(null);
  
//   // Catégories dans l'ordre d'affichage
//   const categoriesFr = ['Basic', 'Proactivité : volonté de prendre des initiatives', "Collaboration : travail d'équipe efficace", 'Ouverture au feedback : réceptivité aux commentaires', 'Adaptability: Flexibility in change', "Amélioration continue : viser l'excellence"];
//   const categoriesEn = ['Basic', 'Proactivity: Willingness to Take Initiative', 'Collaboration: Effective Teamwork', 'Openness to feedback: Receptiveness to Input', 'Adaptability: Flexibility in change', 'Continuous Improvement: Striving for Excellence'];
  
//   // Obtenir les catégories en fonction de la langue sélectionnée
//   const categories = language === 'fr' ? categoriesFr : categoriesEn;
  
//   // Traductions
//   const translations = {
//     fr: {
//       other: "Autre",
//       pleaseSpecify: "Veuillez préciser...",
//       enterAnswer: "Entrez votre réponse",
//       questionsFor: "Questions pour",
//       saveAnswers: "Enregistrer les réponses",
//       obligatoire: "* Questions obligatoires",
//       expandAll: "Développer tout",
//       collapseAll: "Réduire tout"
//     },
//     en: {
//       other: "Other",
//       pleaseSpecify: "Please specify...",
//       enterAnswer: "Enter your answer",
//       questionsFor: "Questions for",
//       saveAnswers: "Save Answers",
//       obligatoire: "* Required questions",
//       expandAll: "Expand all",
//       collapseAll: "Collapse all"
//     }
//   };
  
//   // Accès facile aux traductions
//   const t = translations[language];
  
//   // Mapping des noms courts vers les noms de catégories complets
//   const categoryMapping = {
//     "General": 'Basic',
//     "Proactivity": 'Proactivity: Willingness to Take Initiative',
//     "Collaboration": 'Collaboration: Effective Teamwork',
//     "Openness to Feedback": 'Openness to feedback: Receptiveness to Input',
//     "Adaptability": 'Adaptability: Flexibility in change',
//     "Continuous Improvement": 'Continuous Improvement: Striving for Excellence'
//   };

//   // Définition des catégories avec leurs icônes
//   const categoryItems = [
//     { 
//       name: "General", 
//       iconPath: General,
//       delay: '0.1s' 
//     },
//     { 
//       name: "Proactivity", 
//       iconPath: Proactivity,
//       delay: '0.3s'
//     },
//     { 
//       name: "Collaboration", 
//       iconPath: Collaboration,
//       delay: '0.5s'
//     },
//     { 
//       name: "Openness to Feedback", 
//       iconPath: Openness,
//       delay: '0.7s'
//     },
//     { 
//       name: "Adaptability", 
//       iconPath: Adaptability,
//       delay: '0.9s'
//     },
//     { 
//       name: "Continuous Improvement", 
//       iconPath: Continuous,
//       delay: '1s'
//     }
//   ];

//   // Charger les questions lorsqu'une catégorie est sélectionnée
//   useEffect(() => {
//     if (selectedCategory) {
//       const fetchQuestions = async () => {
//         setLoading(true);
//         try {
//           // Utiliser le mapping pour obtenir le nom complet de la catégorie
//           const categoryName = categoryMapping[selectedCategory] || selectedCategory;
//           const data = await ApiService.getQuestionsByCategory(categoryName);
//           setQuestions(data);
//         } catch (error) {
//           console.error('Erreur lors du chargement des questions:', error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchQuestions();
//     }
//   }, [selectedCategory]);

//   // Gérer le clic sur une catégorie
//   const handleCategoryClick = (categoryName) => {
//     setSelectedCategory(categoryName);
//     // Réinitialiser les réponses lors du changement de catégorie
//     setAnswers({});
//     setOtherAnswers({});
//     setShowValidationIcons(false);
//     setExpandedQuestion(null);
//   };

//   // Gérer le changement de réponse
//   const handleAnswerChange = (questionId, value) => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionId]: value
//     }));
    
//     // Si la valeur n'est pas "Autre" ou "Other", réinitialiser la valeur dans otherAnswers
//     if (value !== t.other) {
//       setOtherAnswers(prev => {
//         const newOtherAnswers = { ...prev };
//         delete newOtherAnswers[questionId];
//         return newOtherAnswers;
//       });
//     }
//   };

//   // Gérer le changement de l'entrée "Autre"
//   const handleOtherInputChange = (questionId, value) => {
//     setOtherAnswers(prev => ({
//       ...prev,
//       [questionId]: value
//     }));
//   };

//   // Gérer la sauvegarde des réponses
//   const handleSaveAnswers = () => {
//     setShowValidationIcons(true);
    
//     // Vérifier si toutes les questions obligatoires ont été répondues
//     const missingRequiredQuestions = getMissingRequiredQuestions();
    
//     if (missingRequiredQuestions.length === 0) {
//       // Ici, vous pouvez ajouter le code pour enregistrer les réponses
//       console.log("Réponses sauvegardées", answers, otherAnswers);
      
//       // Afficher un message de succès
//       alert("Vos réponses ont été enregistrées avec succès!");
      
//       // Réinitialiser les icônes de validation
//       setShowValidationIcons(false);
//     } else {
//       // Ouvrir automatiquement la première question non répondue
//       setExpandedQuestion(missingRequiredQuestions[0]);
      
//       // Faire défiler jusqu'à la première question non répondue
//       const firstMissingQuestionId = missingRequiredQuestions[0];
//       const element = document.getElementById(`question-${firstMissingQuestionId}`);
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }
//   };

//   // Gérer l'expansion/réduction d'une question
//   const toggleQuestion = (questionId) => {
//     setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
//   };

//   // Étendre toutes les questions
//   const expandAllQuestions = () => {
//     setExpandedQuestion('all');
//   };

//   // Réduire toutes les questions
//   const collapseAllQuestions = () => {
//     setExpandedQuestion(null);
//   };

//   // Vérifier si une question a un type de saisie texte
//   const isTextInputQuestion = (question) => {
//     return question && question.answers && question.answers.length === 0;
//   };

//   // Vérifier si l'option "autre" est sélectionnée pour une question
//   const isOtherOptionSelected = (questionId) => {
//     return answers[questionId] === "Autre" || answers[questionId] === "Other";
//   };

//   // Vérifier si une question spécifique a été répondue
//   const isQuestionAnswered = (questionId) => {
//     return !!answers[questionId];
//   };

//   // Obtenir la liste des questions obligatoires non répondues
//   const getMissingRequiredQuestions = () => {
//     return questions
//       .filter(q => q.required && !answers[q.id])
//       .map(q => q.id);
//   };

//   // Vérifier si toutes les questions obligatoires ont été répondues
//   const areRequiredQuestionsAnswered = () => {
//     return getMissingRequiredQuestions().length === 0;
//   };

//   // Obtenir le texte de la question en fonction de la langue
//   const getQuestionText = (question) => {
//     return language === 'fr' ? question.question : (question.questionAng || question.question);
//   };

//   // Obtenir les réponses en fonction de la langue
//   const getAnswersForLanguage = (question) => {
//     return language === 'fr' ? question.answers : (question.answersAng || question.answers);
//   };

//   // Vérifier si une question est actuellement étendue
//   const isQuestionExpanded = (questionId) => {
//     return expandedQuestion === 'all' || expandedQuestion === questionId;
//   };

//   return (
//     <div className="text-white">
//       <div className="mb-6">
//         <p className="text-lg text-white mb-2">The assessment is composed of 6 sections. Around 10min will be needed to complete them all</p>
//         <p className="text-lg text-white mb-2">Section 1: 9 questions for filtering and cross analysis of data.</p>
//         <p className="text-lg text-white mb-2">Section 2 to 6: 10 questions for each category.</p>
//       </div>
      
//       <div className="flex flex-col">
//         <div className="border border-white rounded-3xl p-6 mt-4 animate-scaleUp bg- bg-opacity-60">
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
//             {categoryItems.map((category, index) => (
//               <div 
//                 key={index} 
//                 className={`flex flex-col items-center justify-center animate-popIn cursor-pointer transition-all duration-300 
//                   w-full h-32 rounded-xl hover:shadow-lg hover:shadow-orange-400/20 ${selectedCategory === category.name 
//                   ? 'bg-gradient-to-br from-orange-600 to-orange-800 scale-105 shadow-md shadow-orange-500/30' 
//                   : 'bg-black-800 hover:bg-orange-900'}`}
//                 style={{ animationDelay: category.delay }}
//                 onClick={() => handleCategoryClick(category.name)}
//               >
//                 <div className={`mb-2 ${selectedCategory === category.name ? 'text-white' : 'text-orange-500'}`}>
//                   <img 
//                     src={category.iconPath} 
//                     alt={category.name} 
//                     className="w-14 h-14" 
//                   />
//                 </div>
//                 <span className="text-white text-center font-medium px-2">{category.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Section d'affichage des questions */}
//       {loading ? (
//         <div className="mt-8 flex justify-center p-12">
//           <Loader />
//         </div>
//       ) : selectedCategory && questions.length > 0 ? (
//         <div className="mt-8 animate-slideInTop max-w-4xl mx-auto">
//           <div className="bg-gradient-to-r from- to-orange-800 rounded-t-xl p-6 border-b border-orange-500 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
//             <h3 className="text-2xl font-bold">{t.questionsFor} {selectedCategory}</h3>
//             <div className="flex space-x-4 items-center">
//               <button 
//                 onClick={expandAllQuestions}
//                 className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center"
//               >
//                 <ChevronDown size={16} className="mr-1" /> {t.expandAll}
//               </button>
//               <button 
//                 onClick={collapseAllQuestions}
//                 className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center"
//               >
//                 <ChevronUp size={16} className="mr-1" /> {t.collapseAll}
//               </button>
//               <span className="text-orange-500 text-sm">{t.obligatoire}</span>
//             </div>
//           </div>
          
//           {/* Zone défilante pour les questions */}
//           <div className="bg- bg-opacity-90 rounded-b-xl shadow-xl flex flex-col">
//             {/* Zone de défilement avec hauteur fixe */}
//             <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: "60vh" }}>
//               <div className="space-y-4">
//                 {questions.slice(0, selectedCategory === 'General' ? 9 : 10).map((q, index) => (
//                   <div 
//                     key={q._id || index} 
//                     id={`question-${q.id}`}
//                     className={`rounded-lg transition-all duration-300 border ${
//                       showValidationIcons && q.required && !isQuestionAnswered(q.id)
//                         ? 'border-red-500'
//                         : 'border-white-400'
//                     }`}
//                   >
//                     {/* En-tête de la question (toujours visible) */}
//                     <div 
//                       className={`p-4 rounded-lg cursor-pointer flex items-start justify-between ${
//                         isQuestionExpanded(q.id) ? 'bg-gray-800' : 'hover:bg-orange-800'
//                       }`}
//                       onClick={() => toggleQuestion(q.id)}
//                     >
//                       <div className="flex items-center flex-grow">
//                         <div className={`mr-3 h-8 w-8 flex items-center justify-center rounded-full ${
//                           isQuestionAnswered(q.id) ? 'bg-green-600' : 'bg-gray-700'
//                         }`}>
//                           {isQuestionAnswered(q.id) ? (
//                             <CircleCheckBig size={20} className="text-white" />
//                           ) : (
//                             <span className="text-white font-medium">{q.id}</span>
//                           )}
//                         </div>
//                         <p className="text-lg font-medium line-clamp-2">
//                           {getQuestionText(q)} {q.required && <span className="text-red-500">*</span>}
//                         </p>
//                       </div>
//                       <div className="ml-2 flex-shrink-0 flex items-center">
//                         {isQuestionExpanded(q.id) ? (
//                           <ChevronUp size={20} className="text-orange-500" />
//                         ) : (
//                           <ChevronDown size={20} className="text-orange-500" />
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* Contenu de la question (visible uniquement si étendu) */}
//                     {isQuestionExpanded(q.id) && (
//                       <div className="p-4 pt-2 bg-gray-800 rounded-b-lg border-t border-gray-700">
//                         <div className="space-y-3 ml-11">
//                           {isTextInputQuestion(q) ? (
//                             // Champ texte pour les questions sans réponses prédéfinies
//                             <div className="flex items-center">
//                               <input
//                                 type="text"
//                                 id={`q${q.id}`}
//                                 name={`question_${q.id}`}
//                                 value={answers[q.id] || ''}
//                                 onChange={(e) => handleAnswerChange(q.id, e.target.value)}
//                                 className={`w-full p-3 rounded bg-gray-700 text-white border ${
//                                   showValidationIcons && q.required && !answers[q.id]
//                                     ? 'border-red-500 focus:ring-2 focus:ring-red-500'
//                                     : 'border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
//                                 } outline-none transition-all`}
//                                 required={q.required}
//                                 placeholder={t.enterAnswer}
//                               />
//                             </div>
//                           ) : (
//                             // Options de réponse pour les questions avec choix
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                               {getAnswersForLanguage(q).map((answer, i) => (
//                                 <div key={i} className="flex items-center">
//                                   <input
//                                     type="radio"
//                                     id={`q${q.id}_${i}`}
//                                     name={`question_${q.id}`}
//                                     value={answer}
//                                     checked={answers[q.id] === answer}
//                                     onChange={() => handleAnswerChange(q.id, answer)}
//                                     className={`mr-3 h-5 w-5 text-orange-500 focus:ring-orange-500 ${
//                                       showValidationIcons && q.required && !answers[q.id]
//                                         ? 'ring-2 ring-red-500'
//                                         : ''
//                                     }`}
//                                     required={q.required}
//                                   />
//                                   <label 
//                                     htmlFor={`q${q.id}_${i}`} 
//                                     className="text-white cursor-pointer hover:text-orange-300 transition-colors"
//                                   >
//                                     {answer}
//                                   </label>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
                          
//                           {/* Afficher le champ de saisie si "Autre" est sélectionné */}
//                           {isOtherOptionSelected(q.id) && (
//                             <div className="mt-2">
//                               <input
//                                 type="text"
//                                 id={`q${q.id}_other`}
//                                 name={`question_${q.id}_other`}
//                                 value={otherAnswers[q.id] || ''}
//                                 onChange={(e) => handleOtherInputChange(q.id, e.target.value)}
//                                 className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//                                 placeholder={t.pleaseSpecify}
//                                 required={q.required}
//                               />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Bouton de sauvegarde fixé en bas */}
//             <div className="flex justify-end p-6 pt-4 bg- border-t border-gray-800 rounded-b-xl sticky bottom-0">
//               <button
//                 onClick={handleSaveAnswers}
//                 className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 font-medium"
//               >
//                 {t.saveAnswers}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}

//       <style>{`
//         @keyframes slideInTop {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes slideInLeft {
//           from {
//             opacity: 0;
//             transform: translateX(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }
        
//         @keyframes scaleUp {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
        
//         @keyframes popIn {
//           0% {
//             opacity: 0;
//             transform: scale(0.8);
//           }
//           70% {
//             opacity: 1;
//             transform: scale(1.1);
//           }
//           100% {
//             transform: scale(1);
//           }
//         }
        
//         .animate-slideInTop {
//           animation: slideInTop 0.5s ease-out;
//         }
        
//         .animate-slideInLeft {
//           animation: slideInLeft 0.5s ease-out;
//           animation-delay: 0.2s;
//           animation-fill-mode: both;
//         }
        
//         .animate-scaleUp {
//           animation: scaleUp 0.5s ease-out;
//           animation-delay: 0.3s;
//           animation-fill-mode: both;
//         }
        
//         .animate-popIn {
//           animation: popIn 0.5s ease-out;
//           animation-fill-mode: both;
//         }

//         /* Styles pour la barre de défilement personnalisée */
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #1a202c;
//           border-radius: 10px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #ed8936;
//           border-radius: 10px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #dd6b20;
//         }

//         /* Styles pour les boutons radio personnalisés */
//         input[type="radio"] {
//           appearance: none;
//           -webkit-appearance: none;
//           width: 20px;
//           height: 20px;
//           border: 2px solid #4a5568;
//           border-radius: 50%;
//           outline: none;
//           cursor: pointer;
//         }
        
//         input[type="radio"]:checked {
//           border: 2px solid #ed8936;
//           background-color: #ed8936;
//           box-shadow: 0 0 0 2px #000 inset;
//         }
        
//         input[type="radio"]:focus {
//           box-shadow: 0 0 0 3px rgba(237, 137, 54, 0.5);
//         }
        
//         /* Style pour limiter le nombre de lignes dans le texte */
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AssessmentCategoriesComponent;

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

const AssessmentCategoriesComponent = () => {
  // États pour gérer les questions et les réponses
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [otherAnswers, setOtherAnswers] = useState({});
  const [language, setLanguage] = useState('fr');
  const [showValidationIcons, setShowValidationIcons] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [direction, setDirection] = useState(1); // 1 pour droite, -1 pour gauche
  
  // Catégories dans l'ordre d'affichage
  const categoriesFr = ['Basic', 'Proactivité : volonté de prendre des initiatives', "Collaboration : travail d'équipe efficace", 'Ouverture au feedback : réceptivité aux commentaires', 'Adaptability: Flexibility in change', "Amélioration continue : viser l'excellence"];
  const categoriesEn = ['Basic', 'Proactivity: Willingness to Take Initiative', 'Collaboration: Effective Teamwork', 'Openness to feedback: Receptiveness to Input', 'Adaptability: Flexibility in change', 'Continuous Improvement: Striving for Excellence'];
  
  // Obtenir les catégories en fonction de la langue sélectionnée
  const categories = language === 'fr' ? categoriesFr : categoriesEn;
  
  // Traductions
  const translations = {
    fr: {
      other: "Autre",
      pleaseSpecify: "Veuillez préciser...",
      enterAnswer: "Entrez votre réponse",
      questionsFor: "Questions pour",
      saveAnswers: "Enregistrer les réponses",
      obligatoire: "* Questions obligatoires",
      expandAll: "Développer tout",
      collapseAll: "Réduire tout"
    },
    en: {
      other: "Other",
      pleaseSpecify: "Please specify...",
      enterAnswer: "Enter your answer",
      questionsFor: "Questions for",
      saveAnswers: "Save Answers",
      obligatoire: "* Required questions",
      expandAll: "Expand all",
      collapseAll: "Collapse all"
    }
  };
  
  // Accès facile aux traductions
  const t = translations[language];
  
  // Mapping des noms courts vers les noms de catégories complets
  const categoryMapping = {
    "General": 'Basic',
    "Proactivity": 'Proactivity: Willingness to Take Initiative',
    "Collaboration": 'Collaboration: Effective Teamwork',
    "Openness to Feedback": 'Openness to feedback: Receptiveness to Input',
    "Adaptability": 'Adaptability: Flexibility in change',
    "Continuous Improvement": 'Continuous Improvement: Striving for Excellence'
  };

  // Définition des catégories avec leurs icônes
  const categoryItems = [
    { 
      name: "General", 
      iconPath: General,
      delay: 0.1 
    },
    { 
      name: "Proactivity", 
      iconPath: Proactivity,
      delay: 0.3
    },
    { 
      name: "Collaboration", 
      iconPath: Collaboration,
      delay: 0.5
    },
    { 
      name: "Openness to Feedback", 
      iconPath: Openness,
      delay: 0.7
    },
    { 
      name: "Adaptability", 
      iconPath: Adaptability,
      delay: 0.9
    },
    { 
      name: "Continuous Improvement", 
      iconPath: Continuous,
      delay: 1.0
    }
  ];

  // Charger les questions lorsqu'une catégorie est sélectionnée
  useEffect(() => {
    if (selectedCategory) {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          // Utiliser le mapping pour obtenir le nom complet de la catégorie
          const categoryName = categoryMapping[selectedCategory] || selectedCategory;
          const data = await ApiService.getQuestionsByCategory(categoryName);
          setQuestions(data);
        } catch (error) {
          console.error('Erreur lors du chargement des questions:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [selectedCategory]);

  // Gérer le clic sur une catégorie
  const handleCategoryClick = (categoryName) => {
    // Déterminer la direction de l'animation
    const currentIndex = categoryItems.findIndex(item => item.name === selectedCategory);
    const newIndex = categoryItems.findIndex(item => item.name === categoryName);
    setDirection(newIndex > currentIndex ? 1 : -1);
    
    setSelectedCategory(categoryName);
    // Réinitialiser les réponses lors du changement de catégorie
    setAnswers({});
    setOtherAnswers({});
    setShowValidationIcons(false);
    setExpandedQuestion(null);
  };

  // Gérer le changement de réponse
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Si la valeur n'est pas "Autre" ou "Other", réinitialiser la valeur dans otherAnswers
    if (value !== t.other) {
      setOtherAnswers(prev => {
        const newOtherAnswers = { ...prev };
        delete newOtherAnswers[questionId];
        return newOtherAnswers;
      });
    }
  };

  // Gérer le changement de l'entrée "Autre"
  const handleOtherInputChange = (questionId, value) => {
    setOtherAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Gérer la sauvegarde des réponses
  const handleSaveAnswers = () => {
    setShowValidationIcons(true);
    
    // Vérifier si toutes les questions obligatoires ont été répondues
    const missingRequiredQuestions = getMissingRequiredQuestions();
    
    if (missingRequiredQuestions.length === 0) {
      // Ici, vous pouvez ajouter le code pour enregistrer les réponses
      console.log("Réponses sauvegardées", answers, otherAnswers);
      
      // Afficher un message de succès
      alert("Vos réponses ont été enregistrées avec succès!");
      
      // Réinitialiser les icônes de validation
      setShowValidationIcons(false);
    } else {
      // Ouvrir automatiquement la première question non répondue
      setExpandedQuestion(missingRequiredQuestions[0]);
      
      // Faire défiler jusqu'à la première question non répondue
      const firstMissingQuestionId = missingRequiredQuestions[0];
      const element = document.getElementById(`question-${firstMissingQuestionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Gérer l'expansion/réduction d'une question
  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  // Étendre toutes les questions
  const expandAllQuestions = () => {
    setExpandedQuestion('all');
  };

  // Réduire toutes les questions
  const collapseAllQuestions = () => {
    setExpandedQuestion(null);
  };

  // Vérifier si une question a un type de saisie texte
  const isTextInputQuestion = (question) => {
    return question && question.answers && question.answers.length === 0;
  };

  // Vérifier si l'option "autre" est sélectionnée pour une question
  const isOtherOptionSelected = (questionId) => {
    return answers[questionId] === "Autre" || answers[questionId] === "Other";
  };

  // Vérifier si une question spécifique a été répondue
  const isQuestionAnswered = (questionId) => {
    return !!answers[questionId];
  };

  // Obtenir la liste des questions obligatoires non répondues
  const getMissingRequiredQuestions = () => {
    return questions
      .filter(q => q.required && !answers[q.id])
      .map(q => q.id);
  };

  // Vérifier si toutes les questions obligatoires ont été répondues
  const areRequiredQuestionsAnswered = () => {
    return getMissingRequiredQuestions().length === 0;
  };

  // Obtenir le texte de la question en fonction de la langue
  const getQuestionText = (question) => {
    return language === 'fr' ? question.question : (question.questionAng || question.question);
  };

  // Obtenir les réponses en fonction de la langue
  const getAnswersForLanguage = (question) => {
    return language === 'fr' ? question.answers : (question.answersAng || question.answers);
  };

  // Vérifier si une question est actuellement étendue
  const isQuestionExpanded = (questionId) => {
    return expandedQuestion === 'all' || expandedQuestion === questionId;
  };

  // Animation variants pour les questions
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

  // Animation pour le conteneur des questions
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

  return (
    <div className="text-white">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg text-white mb-2">The assessment is composed of 6 sections. Around 10min will be needed to complete them all</p>
        <p className="text-lg text-white mb-2">Section 1: 9 questions for filtering and cross analysis of data.</p>
        <p className="text-lg text-white mb-2">Section 2 to 6: 10 questions for each category.</p>
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
                transition={{ 
                  duration: 0.5,
                  delay: category.delay,
                  type: "spring",
                  damping: 10,
                  stiffness: 100
                }}
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
                <span className="text-white text-center font-medium px-2">{category.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Section d'affichage des questions */}
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
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronDown size={16} className="mr-1" /> {t.expandAll}
              </motion.button>
              <motion.button 
                onClick={collapseAllQuestions}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronUp size={16} className="mr-1" /> {t.collapseAll}
              </motion.button>
              <span className="text-orange-500 text-sm">{t.obligatoire}</span>
            </div>
          </motion.div>
          
          {/* Zone défilante pour les questions */}
          <div className="bg- bg-opacity-90 rounded-b-xl shadow-xl flex flex-col">
            {/* Zone de défilement avec hauteur fixe */}
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
                    layout // Ajout de la prop layout pour une animation fluide lors du réarrangement
                  >
                    {/* En-tête de la question (toujours visible) */}
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
                    
                    {/* Contenu de la question (visible uniquement si étendu) */}
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
                              // Champ texte pour les questions sans réponses prédéfinies
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
                              // Options de réponse pour les questions avec choix
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
                            
                            {/* Afficher le champ de saisie si "Autre" est sélectionné */}
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

            {/* Bouton de sauvegarde fixé en bas */}
            <motion.div 
              className="flex justify-end p-6 pt-4 bg- border-t border-gray-800 rounded-b-xl sticky bottom-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <motion.button
                onClick={handleSaveAnswers}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.saveAnswers}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}

      <style>{`
        /* Styles pour la barre de défilement personnalisée */
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

        /* Styles pour les boutons radio personnalisés */
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
        
        /* Style pour limiter le nombre de lignes dans le texte */
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