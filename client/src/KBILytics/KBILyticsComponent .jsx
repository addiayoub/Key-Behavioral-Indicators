import { useState, useEffect } from 'react';
import logo from '/Picture2.png';
import tete from '/tete.png';
import picture10 from '/Picture10.png';
import menuImage from '/menu-vertical.png';
import './style/KBILyticsComponent.css';
import MenuItems from '../data/menuItems';
// Import du composant LanguageSwitcher
// Import du composant LanguageSwitcher
import LanguageSwitcher from '../Language/LanguageSwitcher ';
// Import des traductions
import { Translations } from "../Language/datalang";
// Import des composants séparés
import { 
  ContentViewHandler
} from './MenuItemComponents';

const KBILyticsComponent = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [lineAnimation, setLineAnimation] = useState(false);
  const [menuItemsVisible, setMenuItemsVisible] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [contentElementsVisible, setContentElementsVisible] = useState([]);
  // État pour la langue avec récupération de la préférence utilisateur si disponible
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || 'fr'; // Default to French if no preference is saved
  });

  // Traduire le texte en fonction de la langue
  const translations = Translations;
  const t = translations[language];

  // Sauvegarder la préférence linguistique quand elle change
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const handleStartClick = () => {
    setShowMenu(true);
    setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(() => {
        setMenuVisible(true);
        setTimeout(() => setLineAnimation(true), 200);
        
        const totalItems = 6;
        for (let i = 0; i < totalItems; i++) {
          setTimeout(() => {
            setMenuItemsVisible(prev => [...prev, i]);
          }, 300 + (i * 150));
        }
      }, 100);
    }, 1000);
  };

  const handleMenuItemClick = (index) => {
    setSelectedItem(index);
    setMenuVisible(false);
    setContentElementsVisible([]);
    
    // Animate content elements one by one
    setTimeout(() => {
      setContentElementsVisible([0]); // Title
      setTimeout(() => {
        setContentElementsVisible([0, 1]); // Left section
        setTimeout(() => {
          setContentElementsVisible([0, 1, 2]); // Content
        }, 150);
      }, 150);
    }, 150);
  };

  const handleBackClick = () => {
    setContentElementsVisible([]);
    setTimeout(() => {
      setSelectedItem(null);
      setMenuVisible(true);
    }, 300);
  };

  const menuItems = MenuItems;
  
  if (!showMenu) {
    return (
      <div id='Landing_page_view' className="flex flex-col items-center justify-center w-full h-screen bg-black text-white px-4 relative">
        {/* Language Switcher dans le coin supérieur droit */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl">
          <div className="flex flex-col items-center md:items-start space-y-2 mb-8 md:mb-0">
            <img src={logo} alt="KBI-LYTICS Logo" className="w-40 md:w-150" />
          </div>

          <div className="w-40 h-40 md:w-120 md:h-120 relative">
            <img 
              src={tete}
              alt="Puzzle Head" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="mt-8 md:mt-12">
          <button 
            onClick={handleStartClick}
            className="px-6 py-3 md:px-8 md:py-3 bg-orange-500 text-white font-bold text-lg md:text-xl rounded-full hover:bg-orange-600 cursor-pointer transition-colors duration-300 shadow-lg"
          >
            {language === 'fr' ? 'DÉMARRER' : 'START'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden relative">
      {/* Language Switcher dans le coin supérieur droit */}
      <div className="absolute top-4 right-20 z-20">
        <LanguageSwitcher language={language} setLanguage={setLanguage} />
      </div>
      
      {/* Background elements */}
      <div 
        className={`absolute transition-all duration-1000 ease-in-out ${animationComplete ? 'top-4 left-4 w-12 h-12 md:w-20 md:h-20' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48'}`}
      >
        <img src={tete} alt="Puzzle Head" className="w-full h-full object-contain" />
      </div>

      <div 
        className={`absolute transition-all duration-1000 ease-in-out ${animationComplete ? 'bottom-4 right-14 w-20 h-20 md:w-32 md:h-32' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64'}`}
      >
        <img src={logo} alt="KBI-LYTICS Logo" className="w-full h-full object-contain" />
      </div>

      {animationComplete && (
        <div className="absolute top-4 right-4 transition-opacity duration-500 w-12 h-12 md:w-auto md:h-auto">
          <img 
            id='img_equipe'
            src={picture10} 
            alt="Additional Icon" 
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Vertical line */}
      {(menuVisible || selectedItem !== null) && (
        <div className="hidden md:block absolute left-6 top-0 h-full overflow-hidden">
          <div 
            className={`w-1 bg-gradient-to-b from-transparent via-orange-500 to-transparent transition-all duration-1000 ease-in-out 
                      ${lineAnimation ? 'h-full' : 'h-0'}`}
            style={{
              animation: lineAnimation ? 'lineGrow 1s ease-in-out' : 'none'
            }}
          ></div>
        </div>
      )}

      {/* Menu view */}
      <div 
        className={`absolute inset-0 transition-all duration-500 ease-in-out
                  ${menuVisible ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        style={{
          transform: menuVisible ? 'translateX(0)' : 'translateX(-50px)'
        }}
      >
        <div className="w-full h-full flex justify-center pt-16 sm:pt-20 md:pt-28">
          <div className="flex flex-col sm:flex-row w-full max-w-5xl px-4 md:px-8">
            <div className="flex justify-center sm:justify-start mb-6 sm:mb-0 sm:mr-4 md:mr-6">
            
            </div>
            
            <div className="flex-1 relative">
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => handleMenuItemClick(index)}
                  className={`selection flex items-start my-3 sm:my-4 md:my-6 cursor-pointer hover: p-2 md:p-3 rounded-lg transition-all
                            ${menuItemsVisible.includes(index) ? 
                                'animate-float' : 
                                'opacity-0 translate-x-10'}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    transformOrigin: 'left center'
                  }}
                >
                  <div className="flex-shrink-0 mr-2 sm:mr-3 md:mr-4">
                    <img src={item.icon} alt="Icon" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="text-sm sm:text-base md:text-base">
                    <span className="font-medium text-orange-500">
                      {language === 'fr' ? item.title : (item.titleEn || item.title)}
                    </span>
                    <div className="sm:inline">
                      <span className="text-white"> : {language === 'fr' ? item.description : (item.descriptionEn || item.description)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content view - utilisation du ContentViewHandler avec passage de la langue */}
      {selectedItem !== null && (
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out 
                     ${contentElementsVisible.length > 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <ContentViewHandler 
            selectedItem={selectedItem} 
            menuItems={menuItems} 
            onBackClick={handleBackClick}
            language={language}
            setLanguage={setLanguage}
          />
        </div>
      )}

      {/* CSS Animations */}
      <style >{`
        @keyframes float {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
          100% {
            transform: translateX(0);
          }
        }
        @keyframes lineGrow {
          from {
            height: 0;
          }
          to {
            height: 100%;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
          opacity: 1;
          transform: translateX(0);
        }
        .animate-fade-in {
          animation: fadeIn 0.8s forwards;
        }
        
        @media (max-width: 640px) {
          .animate-float {
            animation: float 2s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default KBILyticsComponent;