import { useState, useEffect } from 'react';
import './Form.css';
import logo from '/nhancit.png';
import ApiService from './ApiService';
import Loader from "../loader/Loader";
import { CircleX, CircleCheckBig } from 'lucide-react';
import Swal from 'sweetalert2';
import LanguageSwitcher from '../Language/LanguageSwitcher ';
import { Translations } from "../Language/datalang"
const Form = () => {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [otherAnswers, setOtherAnswers] = useState({}); // Pour stocker les réponses "autre"
  const [startLoading, setStartLoading] = useState(false);
  const questionsPerPage = 10;
  const [allQuestions, setAllQuestions] = useState([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showValidationIcons, setShowValidationIcons] = useState(false);
  const [questionsMap, setQuestionsMap] = useState({});  // Map pour accéder facilement aux questions par ID
  const [language, setLanguage] = useState('fr'); // 'fr' pour français, 'en' pour anglais

  // Custom SweetAlert configuration with transparent background
  const customSwal = Swal.mixin({
    background: 'transparent',
    backdrop: 'rgba(0,0,0,0.4)',
    color: '#fff', // White text for better visibility on transparent background
    customClass: {
      popup: 'swal-transparent-popup', // Add this class to your CSS
      title: 'swal-transparent-title',
      htmlContainer: 'swal-transparent-content',
      confirmButton: 'swal-transparent-confirm',
      cancelButton: 'swal-transparent-cancel'
    },
    confirmButtonColor: '#FF3D00', // Using the requested orange color for buttons
    cancelButtonColor: 'rgba(60, 60, 60, 0.7)'
  });

  // Définir les catégories dans l'ordre que vous souhaitez les afficher
  const categoriesFr = ['Basic', 'Proactivité : volonté de prendre des initiatives', "Collaboration : travail d'équipe efficace", 'Ouverture au feedback : réceptivité aux commentaires', 'Adaptability: Flexibility in change', "Amélioration continue : viser l'excellence"];
  const categoriesEn = ['Basic', 'Proactivity: Willingness to Take Initiative', 'Collaboration: Effective Teamwork', 'Openness to feedback: Receptiveness to Input', 'Adaptability: Flexibility in change', 'Citing continuous improvement: striving for excellence.'];


  // Obtenir les catégories en fonction de la langue sélectionnée
  const categories = language === 'fr' ? categoriesFr : categoriesEn;

  // Traduire le texte en fonction de la langue
  const translations = Translations
  const t = translations[language];

  // Obtenir la catégorie actuelle en fonction de l'étape
  const getCurrentCategory = () => {
    if (step === 0) return null;
    return categories[step - 1];
  };

  // Vérifier si on est actuellement dans la catégorie Basic
  const isBasicCategory = () => {
    return getCurrentCategory() === 'Basic';
  };

  // Ajouter un gestionnaire d'événement beforeunload pour détecter les actualisations de page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Vérifier si l'utilisateur est en train de remplir le formulaire (pas à l'étape 0 et avec des modifications)
      if (step !== 0 && isFormDirty) {
        // Message standard qui sera affiché par le navigateur
        const message = language === 'fr' 
          ? 'Vous allez perdre toutes vos réponses si vous quittez cette page. Êtes-vous sûr de vouloir continuer ?'
          : 'You will lose all your answers if you leave this page. Are you sure you want to continue?';
        
        e.preventDefault();
        e.returnValue = message; // Pour la compatibilité avec les anciens navigateurs
        return message;
      }
    };

    // Ajouter l'écouteur d'événement au chargement
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Nettoyer l'écouteur d'événement au démontage du composant
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step, isFormDirty, language]);

  // Afficher une alerte SweetAlert lorsque l'utilisateur clique sur le bouton de rafraîchissement ou F5
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Détecter la touche F5 (code 116)
      if (e.keyCode === 116 && step !== 0 && isFormDirty) {
        e.preventDefault();
        showRefreshWarning();
      }
    };

    // Fonction pour afficher l'alerte
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
          // Si l'utilisateur confirme, recharger la page
          window.location.reload();
        }
      });
    };

    // Ajouter l'écouteur d'événement pour les touches
    document.addEventListener('keydown', handleKeyDown);
    
    // Nettoyer l'écouteur d'événement
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [step, isFormDirty, language]);

  // Charger les questions de la catégorie actuelle
  useEffect(() => {
    const currentCategory = getCurrentCategory();
    
    if (currentCategory) {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          const data = await ApiService.getQuestionsByCategory(currentCategory);
          setQuestions(data);
          
          // Mettre à jour la map des questions pour un accès facile
          const newQuestionsMap = { ...questionsMap };
          data.forEach(q => {
            newQuestionsMap[q.id] = q;
          });
          setQuestionsMap(newQuestionsMap);
          
          // Mettre à jour allQuestions avec les nouvelles questions
          setAllQuestions(prevAllQuestions => {
            // Filtrer pour éviter les doublons
            const existingIds = prevAllQuestions.map(q => q.id);
            const newQuestions = data.filter(q => !existingIds.includes(q.id));
            return [...prevAllQuestions, ...newQuestions];
          });
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
  }, [step, language]); // Added language as dependency to reload when language changes

  // Réinitialiser les icônes de validation lors du changement d'étape
  useEffect(() => {
    setShowValidationIcons(false);
  }, [step]);

  const handleStart = () => {
    setStartLoading(true); // Activer le loader au démarrage
    
    // Simuler un temps de chargement avant d'afficher le formulaire
    setTimeout(() => {
      setStartLoading(false);
      setStep(1);
    }, 1500); // Durée du loader (1.5 secondes)
  };

  // Vérifier si toutes les questions obligatoires ont été répondues
  const areRequiredQuestionsAnswered = () => {
    const currentQuestions = getCurrentQuestions();
    for (const question of currentQuestions) {
      if (question.required && !answers[question.id]) {
        return false;
      }
    }
    return true;
  };

  // Récupérer la liste des questions obligatoires non répondues
  const getMissingRequiredQuestions = () => {
    const currentQuestions = getCurrentQuestions();
    return currentQuestions
      .filter(q => q.required && !answers[q.id])
      .map(q => q.id);
  };

  const handleNext = () => {
    // Activer l'affichage des icônes de validation
    setShowValidationIcons(true);
    
    if (areRequiredQuestionsAnswered() && step < categories.length) {
      setStep(step + 1);
      setShowValidationIcons(false); // Réinitialiser pour la prochaine étape
    } else {
      // Récupérer les questions non répondues
      const missingQuestions = getMissingRequiredQuestions();
      
      // Afficher une alerte SweetAlert2 si des questions obligatoires ne sont pas répondues
      if (missingQuestions.length > 0) {
        customSwal.fire({
          title: t.incompleteForm,
          html: `
            <p>${t.answerAllQuestions}</p>
            <p>${t.missingQuestions} ${missingQuestions.join(', ')}</p>
          `,
          icon: 'error',
          confirmButtonText: t.understood
        });
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      setShowValidationIcons(false); // Réinitialiser pour la prochaine étape
    }
  };

  // Trouver l'index de la réponse dans la liste des réponses possibles
  const findAnswerIndex = (questionId, answerValue) => {
    const question = questionsMap[questionId];
    if (!question || !question.answers) return 0;
    
    // Chercher dans les réponses en français
    let index = question.answers.findIndex(a => a === answerValue);
    
    // Si non trouvé et qu'il y a des réponses en anglais, chercher là
    if (index === -1 && question.answersAng) {
      index = question.answersAng.findIndex(a => a === answerValue);
    }
    
    return index >= 0 ? index : 0;
  };

  const handleAnswerChange = (questionId, value) => {
    setIsFormDirty(true); // Marquer le formulaire comme modifié
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

  const handleOtherInputChange = (questionId, value) => {
    setIsFormDirty(true);
    setOtherAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Activer l'affichage des icônes de validation
    setShowValidationIcons(true);
    
    if (areRequiredQuestionsAnswered()) {
      setLoading(true); // Afficher le loader pendant la soumission
      try {
        // Préparer les réponses en incluant les réponses "autre"
        const finalAnswers = { ...answers };
        
        // Nous allons passer directement l'objet otherAnswers à l'API Service
        // au lieu de modifier l'objet answers
        const result = await ApiService.submitAnswers(finalAnswers, otherAnswers);
        setLoading(false);
        setIsFormDirty(false); // Réinitialiser l'état après soumission réussie
        
        // Afficher un message de succès avec SweetAlert2
        customSwal.fire({
          title: t.success,
          text: t.answersSubmitted,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          // Obtenir et afficher les résultats
          try {
            ApiService.getUserResults().then(results => {
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
                      .filter(cat => cat.category !== 'Basic') // Exclure la catégorie Basic des résultats affichés
                      .map(cat => 
                        `<li>${cat.category}: ${cat.rawScore}/${cat.maxPossible} (${Math.round((cat.rawScore/cat.maxPossible)*100)}%)</li>`
                      ).join('')}
                  </ul>
                `,
                icon: 'success',
                confirmButtonText: 'OK'
              });
            });
          } catch (e) {
            console.error('Error retrieving results:', e);
          }
          
          // Réinitialiser le formulaire
          setStep(0);
          setAnswers({});
          setOtherAnswers({});
          setShowValidationIcons(false);
        });
      } catch (error) {
        setLoading(false);
        console.error('Erreur lors de la soumission:', error);
        // Afficher un message d'erreur avec SweetAlert2
        customSwal.fire({
          title: t.error,
          text: t.submissionError,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } else {
      // Récupérer les questions non répondues
      const missingQuestions = getMissingRequiredQuestions();
      
      // Afficher une alerte SweetAlert2 si des questions obligatoires ne sont pas répondues
      if (missingQuestions.length > 0) {
        customSwal.fire({
          title: t.incompleteForm,
          html: `
            <p>${t.answerAllQuestions}</p>
            <p>${t.missingQuestions} ${missingQuestions.join(', ')}</p>
          `,
          icon: 'error',
          confirmButtonText: t.understood
        });
      }
    }
  };

  const getCurrentQuestions = () => {
    // Limiter à 9 questions pour la catégorie "Basic"
    if (getCurrentCategory() === 'Basic') {
      return questions.slice(0, 9);
    }
    return questions.slice(0, questionsPerPage);
  };

  // Check if the question should use text input (when answers array is empty)
  const isTextInputQuestion = (question) => {
    return question && question.answers && question.answers.length === 0;
  };

  // Vérifier si l'option "autre" est sélectionnée pour une question
  const isOtherOptionSelected = (questionId) => {
    return answers[questionId] === "Autre" || answers[questionId] === "Other";
  };

  // Calculer le pourcentage global de toutes les questions répondues
  const calculateTotalCompletionPercentage = () => {
    if (allQuestions.length === 0) return 0;
    
    // Compter combien de questions ont été répondues sur le total
    const answeredCount = allQuestions.filter(q => answers[q.id]).length;
    return Math.round((answeredCount / allQuestions.length) * 100);
  };

  // Vérifier si une question spécifique a été répondue
  const isQuestionAnswered = (questionId) => {
    return !!answers[questionId];
  };

  // Obtenir le texte de la question en fonction de la langue
  const getQuestionText = (question) => {
    return language === 'fr' ? question.question : (question.questionAng || question.question);
  };

  // Obtenir les réponses en fonction de la langue
  const getAnswersForLanguage = (question) => {
    return language === 'fr' ? question.answers : (question.answersAng || question.answers);
  };

  // Afficher le loader pendant le chargement de la page de démarrage ou pendant le chargement des questions
  if ((loading && step !== 0) || startLoading) {
    return (
      <div className="fixed inset-0 w-full flex items-center justify-center">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full bg-gray-900">
      <div className="fixed inset-0 bg-[url('/laptop-desktop.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Language Switcher */}
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
      
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-2">
          <div className="w-full max-w-[280px] md:max-w-[300px] mb-8">
            <img 
              src={logo} 
              alt="Nhancit Logo" 
              className="w-full h-auto"
            />
          </div>

          {step === 0 ? (
            <div className="mt-8 space-y-4 px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {t.keyBehavioral}
              <br className="md:block hidden" />
              <span className="block md:inline">{t.estimatedTime}</span>
            </h1>
            <br />
            <p className="text-lg md:text-3xl text-gray-200 leading-relaxed">
              {t.changeReadiness}
            </p>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
              {t.invitedMessage}
              <br className="hidden md:block" /> 
              {t.invitedMessage1}
              <br className="hidden md:block" />
              {t.invitedMessage2}
            </p>
            <br />
            <button 
              onClick={handleStart} 
              id='demarrer'
              className="w-full sm:w-auto px-6 py-3 rounded-lg transition-colors text-base sm:text-lg"
            >
              {t.startNow}
            </button>
          </div>
          ) : (
            <div className="mt-8 w-full max-w-3xl mb-8">
              <div id='bgform' className="rounded-lg max-h-[70vh]">
                <div className="">
                  <h2 className="text-3xl font-semibold mt-2">
                    {t.keyBehavioral}
                    <br />
                    {t.estimatedTime}
                  </h2>
                  <br />
                  <h3 className='text-lg text-white md:text-3xl '> {getCurrentCategory()}</h3>
                  <br />
                  <span className="text-red-500 text-sm">{t.obligatoire}</span>
                  
                  {/* Indicateur de progression global */}
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                    <div 
                      className="slicer h-2.5 rounded-full" 
                      style={{ width: `${calculateTotalCompletionPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-white mt-1">
                    {calculateTotalCompletionPercentage()}{t.completed}
                  </div>
                </div>
            
                <div className="p-6">
                  {getCurrentQuestions().map((q, index) => (
                    <div key={q._id || index} className="mb-8">
                      <div className="flex items-center justify-between">
                        <p className="text-lg text-white font-medium mb-4 flex-grow">
                          {q.id}. {getQuestionText(q)} {q.required && <span className="text-red-500">*</span>}
                        </p>
                        {q.required && showValidationIcons && (
                          <div className="ml-2">
                            {isQuestionAnswered(q.id) ? (
                              <CircleCheckBig size={24} className="text-green-500" />
                            ) : (
                              <CircleX size={24} className="text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {isTextInputQuestion(q) ? (
                          // Render text input for questions with empty answers array
                          <div className="flex items-center">
                            <input
                              type="text"
                              id={`q${q.id}`}
                              name={`question_${q.id}`}
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className={`w-full p-2 rounded text-white ${showValidationIcons && q.required && !answers[q.id] ? 'border-2 border-red-500' : ''}`}
                              required={q.required}
                              placeholder={t.enterAnswer}
                            />
                          </div>
                        ) : (
                          // Render radio buttons for questions with predefined answers
                          <>
                            {getAnswersForLanguage(q).map((answer, i) => (
                              <div key={i} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`q${q.id}_${i}`}
                                  name={`question_${q.id}`}
                                  value={answer}
                                  checked={answers[q.id] === answer}
                                  onChange={() => handleAnswerChange(q.id, answer)}
                                  className={`mr-3 h-4 w-4 ${showValidationIcons && q.required && !answers[q.id] ? 'ring-2 ring-red-500' : ''}`}
                                  required={q.required}
                                />
                                <label htmlFor={`q${q.id}_${i}`} className="text-white">
                                  {answer}
                                </label>
                              </div>
                            ))}
                            
                            {/* Afficher le champ de saisie si "Autre" est sélectionné */}
                            {isOtherOptionSelected(q.id) && (
                              <div className="ml-7 mt-2">
                                <input
                                  type="text"
                                  id={`q${q.id}_other`}
                                  name={`question_${q.id}_other`}
                                  value={otherAnswers[q.id] || ''}
                                  onChange={(e) => handleOtherInputChange(q.id, e.target.value)}
                                  className="w-full p-2 rounded text-white"
                                  placeholder={t.pleaseSpecify}
                                  required={q.required}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 flex justify-between">
                  {step > 1 && (
                    <button id='Précédent'
                      onClick={handlePrevious}
                      className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      {t.previous}
                    </button>
                  )}
                  <div className="ml-auto">
                    {step < categories.length ? (
                      <button id='Suivant'
                        onClick={handleNext}
                        className="px-6 py-2 text-white rounded transition-colors bg-blue-600 hover:bg-blue-700"
                      >
                        {t.next}
                      </button>
                    ) : (
                      <button id='Soumettre'
                        onClick={handleSubmit}
                        className="px-6 py-2 text-white rounded transition-colors bg-green-600 hover:bg-green-700"
                      >
                        {t.submit}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;