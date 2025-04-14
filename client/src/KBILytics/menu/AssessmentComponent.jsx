import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import '../style/KBILyticsComponent.css';
import AssessmentCategoriesComponent from './AssessmentCategoriesComponent';

<<<<<<< HEAD
const AssessmentComponent = ({ language }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  
  // Translations for the component
  const translations = {
    fr: {
      introduction: "L'évaluation est composée de 6 sections. Environ 10 minutes seront nécessaires pour les compléter toutes",
      section1: "Section 1: 9 questions pour le filtrage et l'analyse croisée des données.",
      section2to6: "Section 2 à 6: 10 questions pour chaque catégorie.",
      individualOption: "Je suis un particulier, je veux explorer et tester la solution",
      companyOption: "J'ai déjà un login et pwd, je participe avec mon entreprise",
      testButton: "TESTER",
      loginPlaceholder: "Login",
      passwordPlaceholder: "Mot de passe",
      participateButton: "Participer en tant qu'entreprise"
    },
    en: {
      introduction: "The assessment is composed of 6 sections. Around 10min will be needed to complete them all",
      section1: "Section 1: 9 questions for filtering and cross analysis of data.",
      section2to6: "Section 2 to 6: 10 questions for each category.",
      individualOption: "I am an individual, I want to explore and test the solution",
      companyOption: "I already have a login and password, I'm participating with my company",
      testButton: "TEST",
      loginPlaceholder: "Login",
      passwordPlaceholder: "Password",
      participateButton: "Participate as company"
    }
  };
  
  // Get translations based on selected language
  const t = translations[language] || translations.fr; // Default to French if language not found
  
=======
const AssessmentComponent = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
  const handleTestClick = () => {
    console.log("Test button clicked");
    setShowCategories(true);
  };
  
  const handleParticipateClick = () => {
    console.log("Participate button clicked");
    // Additional logic for participation
  };
  
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option !== 'test') {
      setShowCategories(false);
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col text-white ">
      {!showCategories ? (
        <>
          <div className="mb-6">
<<<<<<< HEAD
            <p className="text-lg text-white mb-2">{t.introduction}</p>
            <p className="text-lg text-white mb-2">{t.section1}</p>
            <p className="text-lg text-white mb-2">{t.section2to6}</p>
=======
            <p className="text-lg text-white mb-2">The assessment is composed of 6 sections. Around 10min will be needed to complete them all</p>
            <p className="text-lg text-white mb-2">Section 1: 9 questions for filtering and cross analysis of data.</p>
            <p className="text-lg text-white mb-2">Section 2 to 6: 10 questions for each category.</p>
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
          </div>
              
          <div className="flex flex-col space-y-8 mt-4">
            {/* First option with bookmark icon */}
            <div id='Landing_page_view'
              className="partciper flex items-center cursor-pointer"
              onClick={() => handleOptionClick('test')}
            >
              
              <div className="flex-shrink-0 mr-4">
                <div className="text-orange-600 w-10 h-10 flex items-center justify-center">
                {selectedOption === 'test' ? <BookmarkCheck /> : <Bookmark />}
                </div>
              </div>
<<<<<<< HEAD
              <div className="flex-1 text-lg">{t.individualOption}</div>
=======
              <div className="flex-1 text-lg">Je suis un particulier, je veux explorer et tester la solution</div>
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
              
              {selectedOption === 'test' && (
                <button 
                  onClick={handleTestClick} 
                  id='demarrer'
                  className="w-full sm:w-auto px-6 py-3 rounded-lg text-center transition-colors text-base sm:text-lg animate-fadeIn"
                >
<<<<<<< HEAD
                  {t.testButton}
=======
                  TESTER
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
                </button>
              )}
            </div>
            
            {/* Second option with login inputs that appear in front of the text */}
            <div className="relative">
              <div id=''
                className="flex partciper items-center cursor-pointer"
                onClick={() => handleOptionClick('participate')}
              >
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 flex items-center justify-center text-orange-600">
                    {selectedOption === 'participate' ? <BookmarkCheck /> : <Bookmark />}
                  </div>
                </div>
                <div className={`flex-1 text-lg ${selectedOption === 'participate' ? 'opacity-20' : 'opacity-100'} transition-opacity duration-300`}>
<<<<<<< HEAD
                  {t.companyOption}
=======
                  J'ai déjà un login et pwd, je participe avec mon entreprise
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
                </div>
              </div>
              
              {/* Login form - animated to appear in front of the text */}
              {selectedOption === 'participate' && (
                <div id='Landing_page_view' className="absolute inset-0 flex items-center animate-slideDown">
                  <div className="flex-shrink-0 mr-4 w-10"></div> {/* Spacer to align with text */}
                  <div className="flex-1 space-y-4">
                    <div className="flex space-x-4">
                      <input
                        type="text"
<<<<<<< HEAD
                        placeholder={t.loginPlaceholder}
=======
                        placeholder="Login"
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
                        className="flex-1 px-4 py-3 border-2 border-white rounded-lg bg-transparent text-white focus:outline-none"
                      />
                      <input
                        type="password"
<<<<<<< HEAD
                        placeholder={t.passwordPlaceholder}
=======
                        placeholder="Password"
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
                        className="flex-1 px-4 py-3 border-2 border-white rounded-lg bg-transparent text-white focus:outline-none"
                      />
                      <button 
                        onClick={handleParticipateClick} 
                        id='demarrer'
                        className="px-6 py-3 rounded-lg text-center transition-colors text-base sm:text-lg whitespace-nowrap"
                      >
<<<<<<< HEAD
                        {t.participateButton}
=======
                        Participer au tant que entreprise 
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
<<<<<<< HEAD
        <AssessmentCategoriesComponent language={language} />
=======
        <AssessmentCategoriesComponent />
>>>>>>> c544daafe4501996aec58a987f9fcfe441e40a12
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AssessmentComponent;