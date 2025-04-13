import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import '../style/KBILyticsComponent.css';
import AssessmentCategoriesComponent from './AssessmentCategoriesComponent';

const AssessmentComponent = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  
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
            <p className="text-lg text-white mb-2">The assessment is composed of 6 sections. Around 10min will be needed to complete them all</p>
            <p className="text-lg text-white mb-2">Section 1: 9 questions for filtering and cross analysis of data.</p>
            <p className="text-lg text-white mb-2">Section 2 to 6: 10 questions for each category.</p>
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
              <div className="flex-1 text-lg">Je suis un particulier, je veux explorer et tester la solution</div>
              
              {selectedOption === 'test' && (
                <button 
                  onClick={handleTestClick} 
                  id='demarrer'
                  className="w-full sm:w-auto px-6 py-3 rounded-lg text-center transition-colors text-base sm:text-lg animate-fadeIn"
                >
                  TESTER
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
                  J'ai déjà un login et pwd, je participe avec mon entreprise
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
                        placeholder="Login"
                        className="flex-1 px-4 py-3 border-2 border-white rounded-lg bg-transparent text-white focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        className="flex-1 px-4 py-3 border-2 border-white rounded-lg bg-transparent text-white focus:outline-none"
                      />
                      <button 
                        onClick={handleParticipateClick} 
                        id='demarrer'
                        className="px-6 py-3 rounded-lg text-center transition-colors text-base sm:text-lg whitespace-nowrap"
                      >
                        Participer au tant que entreprise 
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <AssessmentCategoriesComponent />
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