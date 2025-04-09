import  { useState } from 'react';
import logo from '/Picture2.png';
import tete from '/tete.png';
import picture10 from '/Picture10.png';
import './KBILyticsComponent.css'
// Icons for the menu
import atGlanceIcon from '/Picture4.png';
import howItWorksIcon from '/Picture5.png';
import assessmentIcon from '/Picture6.png';
import dashboardIcon from '/Picture7.png';
import reportsIcon from '/Picture8.png';
import knowledgeHubIcon from '/Picture9.png';

const KBILyticsComponent = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [lineAnimation, setLineAnimation] = useState(false);

  const handleStartClick = () => {
    setShowMenu(true);
    setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(() => {
        setMenuVisible(true);
        // Démarrer l'animation de la ligne après que le menu est visible
        setTimeout(() => setLineAnimation(true), 200);
      }, 100);
    }, 1000);
  };

  const menuItems = [
    {
      icon: atGlanceIcon,
      title: "At a Glance : Why KBIlytics? The rationale, purpose, and value"
    },
    {
      icon: howItWorksIcon,
      title: "How it Works : Methodology, process, workflow explanation"
    },
    {
      icon: assessmentIcon,
      title: "Assessment : Create, manage, and run behavioral evaluations"
    },
    {
      icon: dashboardIcon,
      title: "Dashboard : Quick insights, navigation hub"
    },
    {
      icon: reportsIcon,
      title: "Reports : Assessment results, analytics, trends, AI-driven insights"
    },
    {
      icon: knowledgeHubIcon,
      title: "Knowledge Hub : Background on KBIs, research, case studies"
    }
  ];

  // Landing page view
  if (!showMenu) {
    return (
      <div id='Landing_page_view' className="flex flex-col items-center justify-center w-full h-screen bg-black text-white">
        <div className="flex flex-row items-center justify-between w-full max-w-6xl px-8">
          <div className="flex flex-col items-start space-y-2">
            <div className="flex flex-col">
              <img src={logo} alt="KBI-LYTICS Logo" className="mt-9 w-150" />
            </div>
          </div>

          <div className="w-120 h-120 relative">
            <img 
              src={tete}
              alt="Puzzle Head" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="mt-12">
          <button 
            onClick={handleStartClick}
            className="px-8 py-3 bg-orange-500 text-white font-bold text-xl rounded-full hover:bg-orange-600 cursor-pointer transition-colors duration-300 shadow-lg"
          >
            DÉMARRER
          </button>
        </div>
      </div>
    );
  }

  // Animation and menu page view
  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden relative">
      {/* Head animation to top left */}
      <div 
        className={`absolute transition-all duration-1000 ease-in-out ${animationComplete ? 'top-4 left-4 w-20 h-20' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48'}`}
      >
        <img src={tete} alt="Puzzle Head" className="w-full h-full object-contain" />
      </div>

      {/* Logo animation to bottom right */}
      <div 
        className={`absolute transition-all duration-1000 ease-in-out ${animationComplete ? 'bottom-4 right-4 w-32 h-32' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64'}`}
      >
        <img src={logo} alt="KBI-LYTICS Logo" className="w-full h-full object-contain" />
      </div>

    {/* Picture10 en haut à droite - seulement après animation */}
    {animationComplete && (
        <div className="absolute top-4 right-4 transition-opacity duration-500">
          <img 
          id='img_equipe'
            src={picture10} 
            alt="Additional Icon" 
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Vertical line on the left with animation */}
      {menuVisible && (
        <div className="absolute left-4 top-0 h-full overflow-hidden">
          <div className={`w-1 bg-gradient-to-b from-transparent via-orange-500 to-transparent transition-all duration-1000 ease-in-out ${lineAnimation ? 'h-full' : 'h-0'}`}></div>
        </div>
      )}

      {/* Menu content with equation on the left */}
      {animationComplete && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center pt-20 pb-20 transition-opacity duration-500 ${menuVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full max-w-3xl px-4 overflow-y-auto relative">
            {/* Equation on the left of the menu */}
            <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 text-orange-500 font-mono text-lg vertical-text">
              [1 2 ÷ 3 = 4]
            </div>
            
            {menuItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center my-6 cursor-pointer hover:bg-gray-900 p-3 rounded-lg transition-all"
              >
                <div className="flex-shrink-0 mr-4">
                  <img src={item.icon} alt="Icon" className="w-9 h-9" />
                </div>
                <div className="text-xl font-medium text-white">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style >{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default KBILyticsComponent;