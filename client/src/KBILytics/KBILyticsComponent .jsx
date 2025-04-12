import { useState } from 'react';
import logo from '/Picture2.png';
import tete from '/tete.png';
import picture10 from '/Picture10.png';
import menuImage from '/menu-vertical.png';
import './KBILyticsComponent.css';
import atGlanceIcon from '/Picture4.png';
import howItWorksIcon from '/Picture5.png';
import assessmentIcon from '/Picture6.png';
import dashboardIcon from '/Picture7.png';
import reportsIcon from '/Picture8.png';
import knowledgeHubIcon from '/Picture9.png';
import { Undo2 } from 'lucide-react';

const KBILyticsComponent = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [lineAnimation, setLineAnimation] = useState(false);
  const [menuItemsVisible, setMenuItemsVisible] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [contentElementsVisible, setContentElementsVisible] = useState([]);

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

  const menuItems = [
    {
      icon: atGlanceIcon,
      title: "At a Glance",
      description: "Why KBIlytics? The rationale, purpose, and value",
      content: {
        title: "Why KBIlytics? The rationale, purpose, and value",
        text: "Rather than reacting to people's attitudes and behaviors during a project, organizations can proactively assess and map behavioral trends within the company. By leveraging this factual understanding, businesses can develop a tailored change management plan before or during a digital or organizational transformation. This approach enhances the likelihood of achieving successful and sustainable outcomes."
      }
    },
    {
      icon: howItWorksIcon,
      title: "How it Works",
      description: "Methodology, process, workflow explanation",
      content: {
        title: "Methodology, process, workflow explanation",
        text: "Detailed methodology explanation goes here. Process workflow description. Step-by-step guide on how the system works."
      }
    },
    {
      icon: assessmentIcon,
      title: "Assessment",
      description: "Create, manage, and run behavioral evaluations",
      content: {
        title: "Create, manage, and run behavioral evaluations",
        text: "Assessment creation process description. Management tools overview. How to run behavioral evaluations."
      }
    },
    {
      icon: dashboardIcon,
      title: "Dashboard",
      description: "Quick insights, navigation hub",
      content: {
        title: "Quick insights, navigation hub",
        text: "Dashboard features overview. How to navigate the interface. Key insights visualization."
      }
    },
    {
      icon: reportsIcon,
      title: "Reports",
      description: "Assessment results, analytics, trends, AI-driven insights",
      content: {
        title: "Assessment results, analytics, trends, AI-driven insights",
        text: "Understanding your assessment results. Analytics and trends interpretation. AI-driven insights explanation."
      }
    },
    {
      icon: knowledgeHubIcon,
      title: "Knowledge Hub",
      description: "Background on KBIs, research, case studies",
      content: {
        title: "Background on KBIs, research, case studies",
        text: "Key Behavioral Indicators background. Research findings and white papers. Case studies and success stories."
      }
    }
  ];

  if (!showMenu) {
    return (
      <div id='Landing_page_view' className="flex flex-col items-center justify-center w-full h-screen bg-black text-white px-4">
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
            DÉMARRER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden relative">
      {/* Background elements */}
      <div 
        className={`absolute transition-all duration-1000 ease-in-out ${animationComplete ? 'top-4 left-4 w-12 h-12 md:w-20 md:h-20' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48'}`}
      >
        <img src={tete} alt="Puzzle Head" className="w-full h-full object-contain" />
      </div>

      <div 
        className={`absolute transition-all duration-1000 ease-in-out ${animationComplete ? 'bottom-4 right-4 w-20 h-20 md:w-32 md:h-32' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64'}`}
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
              <img 
                src={menuImage} 
                alt="Vertical Menu" 
                className="h-32 sm:h-100 md:h-120 object-contain opacity-0 animate-fade-in"
                style={{
                  animation: 'fadeIn 0.8s forwards',
                  animationDelay: '0.5s'
                }}
              />
            </div>
            
            <div className="flex-1 relative">
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => handleMenuItemClick(index)}
                  className={`flex items-start my-3 sm:my-4 md:my-6 cursor-pointer hover:bg-gray-900 p-2 md:p-3 rounded-lg transition-all
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
                    <span className="font-medium text-orange-500">{item.title}</span>
                    <div className="sm:inline">
                      <span className="text-white"> : {item.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content view */}
      {selectedItem !== null && (
        <div className="absolute inset-0 flex flex-col pt-10 px-4 sm:px-8 md:px-20">
          {/* Title with animation */}
          <h1 
            className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-orange-500 text-center  transition-all duration-500
                      ${contentElementsVisible.includes(0) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}
          >
            {menuItems[selectedItem].content.title}
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 pt-20 md:gap-8 items-start flex-grow">
            {/* Left section with animation */}
            <div 
              className={`w-full md:w-1/6 flex flex-col items-center md:items-start mb-4 transition-all duration-500
                        ${contentElementsVisible.includes(1) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 text-white">
                <img src={menuItems[selectedItem].icon} alt="Icon" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                <h2 className="text-lg sm:text-xl font-bold">{menuItems[selectedItem].title}</h2>
              </div>
            </div>

            {/* Main content with paragraph */}
            <div className="w-full md:w-5/6 relative">
              <div className="border border-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-18 border_content ">
                <div className="text-base sm:text-lg">
                  <p 
                    className={`transition-all duration-500
                              ${contentElementsVisible.includes(2) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}
                  >
                    {menuItems[selectedItem].content.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back button */}
          <div className="flex justify-center pb-6 md:pb-8">
            <button 
              onClick={handleBackClick}
              className="bg-orange-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-orange-600 cursor-pointer transition-colors text-sm sm:text-base"
            >
              <Undo2 />
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
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