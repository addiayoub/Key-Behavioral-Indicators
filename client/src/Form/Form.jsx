import { useState, useEffect } from 'react';
import axios from 'axios';
import './Form.css';
import logo from '/nhancit.png';

const Form = () => {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const questionsPerPage = 10;

  // Définir les catégories dans l'ordre que vous souhaitez les afficher
  const categories = ['Basic', 'Proactivity: Willingness to Take Initiative', 'Leadership', 'Performance'];

  // Obtenir la catégorie actuelle en fonction de l'étape
  const getCurrentCategory = () => {
    if (step === 0) return null;
    return categories[step - 1];
  };

  // Charger les questions de la catégorie actuelle
  useEffect(() => {
    const currentCategory = getCurrentCategory();
    
    if (currentCategory) {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:3000/api/questions/category/${currentCategory}`);
          setQuestions(response.data);
        } catch (error) {
          console.error('Erreur lors du chargement des questions:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [step]);

  const handleStart = () => {
    setStep(1);
  };

  const handleNext = () => {
    if (step < categories.length) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getCurrentQuestions = () => {
    return questions.slice(0, questionsPerPage);
  };

  if (loading && step !== 0) {
    return (
      <div className="fixed inset-0 w-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des questions...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full bg-gray-900">
      <div className="fixed inset-0 bg-[url('/laptop-desktop.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
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
                Key Behavioral Indicators
                <br className="md:block hidden" />
                <span className="block md:inline">Estimated time 10min</span>
              </h1>
              <br />
              <p className="text-lg md:text-3xl text-gray-200 leading-relaxed">
                Change Readiness Assessment
              </p>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                You have been invited to participate in this survey.
                Your honest responses will help us better 
                <br className="hidden md:block" /> 
                understand and enhance our organizational culture.
                All responses 
                <br className="hidden md:block" />
                are confidential and anonymous.
              </p>
              <br />
              <button 
                onClick={handleStart} 
                id='demarrer'
                className="w-full sm:w-auto px-6 py-3 rounded-lg transition-colors text-base sm:text-lg"
              >
                Démarrer maintenant
              </button>
            </div>
          ) : (
            <div className="mt-8 w-full max-w-3xl mb-8">
              <div id='bgform' className="rounded-lg max-h-[70vh]">
                <div className="">
                  <h2 className="text-3xl font-semibold mt-2">
                    Key Behavioral Indicators 
                    <br />
                    Estimated time 10min
                  </h2>
                  <br />
                  <h3 className='text-lg text-white md:text-3xl '> {getCurrentCategory()}</h3>
                  <br />
                  <span className="text-red-500 text-sm">* Obligatoire</span>
                </div>
            
                <div className="p-6">
                  {getCurrentQuestions().map((q, index) => (
                    <div key={q._id || index} className="mb-8">
                      <p className="text-lg text-white font-medium mb-4">
                        {q.id}. {q.question} {q.required && <span className="text-red-500">*</span>}
                      </p>
                      <div className="space-y-3">
                        {q.answers.map((answer, i) => (
                          <div key={i} className="flex items-center">
                            <input
                              type="radio"
                              id={`q${q.id}_${i}`}
                              name={`question_${q.id}`}
                              value={answer}
                              className="mr-3 h-4 w-4"
                              required={q.required}
                            />
                            <label htmlFor={`q${q.id}_${i}`} className="text-white">
                              {answer}
                            </label>
                          </div>
                        ))}
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
                      Précédent
                    </button>
                  )}
                  <div className="ml-auto">
                    {step < categories.length ? (
                      <button id='Suivant'
                        onClick={handleNext}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button id='Soumettre'
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Soumettre
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