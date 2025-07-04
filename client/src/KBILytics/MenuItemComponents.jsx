// ContentViewHandler.jsx
import { Undo2 } from 'lucide-react';
import './style/KBILyticsComponent.css';
import AtGlanceComponent from './menu/AtGlanceComponent';
import HowItWorksComponent from './menu/HowItWorksComponent';
import AssessmentComponent from './menu/AssessmentComponent/AssessmentComponent';
import DashboardComponent from './menu/DashboardComponent';
import ReportsComponent from './menu/ReportsComponent';
import KnowledgeHubComponent from './menu/KnowledgeHubComponent';

const ContentViewHandler = ({ selectedItem, menuItems, onBackClick, language, setLanguage }) => {
  const renderContent = () => {
    switch (selectedItem) {
      case 0:
        return <AtGlanceComponent icon={menuItems[selectedItem].icon} title={language === 'fr' ? menuItems[selectedItem].title : (menuItems[selectedItem].titleEn || menuItems[selectedItem].title)}  language={language} />;
      case 1:
        return <HowItWorksComponent icon={menuItems[selectedItem].icon} title={language === 'fr' ? menuItems[selectedItem].title : (menuItems[selectedItem].titleEn || menuItems[selectedItem].title)} language={language} />;
      case 2:
        return <AssessmentComponent icon={menuItems[selectedItem].icon} title={language === 'fr' ? menuItems[selectedItem].title : (menuItems[selectedItem].titleEn || menuItems[selectedItem].title)} language={language} />;
      case 3:        return <ReportsComponent icon={menuItems[selectedItem].icon} title={language === 'fr' ? menuItems[selectedItem].title : (menuItems[selectedItem].titleEn || menuItems[selectedItem].title)} language={language} />;

      case 4:        return <KnowledgeHubComponent icon={menuItems[selectedItem].icon} title={language === 'fr' ? menuItems[selectedItem].title : (menuItems[selectedItem].titleEn || menuItems[selectedItem].title)} language={language} />;

      case 5:
                return <DashboardComponent icon={menuItems[selectedItem].icon} title={language === 'fr' ? menuItems[selectedItem].title : (menuItems[selectedItem].titleEn || menuItems[selectedItem].title)} language={language} />;

      default:
        return <div>No content available</div>;
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col pt-10 px-4 sm:px-8 md:px-20 overflow-y-auto">
      {/* Language Switcher in the top-right corner */}
      <div className="absolute top-4 right-4 z-20">
      </div>
      
      {/* Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-orange-500 text-center">
        {language === 'fr' 
          ? menuItems[selectedItem].content.title 
          : (menuItems[selectedItem].content.titleEn || menuItems[selectedItem].content.title)}
      </h1>
      
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 pt-6 md:gap-8 items-start flex-grow">
        {/* Left section */}
        <div className="w-full md:w-1/6 flex flex-col items-center md:items-start mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 text-white">
            <img src={menuItems[selectedItem].icon} alt="Icon" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            <h2 className="text-lg sm:text-xl font-bold">
              {language === 'fr' 
                ? menuItems[selectedItem].title 
                : (menuItems[selectedItem].titleEn || menuItems[selectedItem].title)}
            </h2>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-5/6 relative">
          {renderContent()}
        </div>
      </div>
      
      {/* Back button */}
      <div className="flex justify-center pb-6 md:pb-8 mt-4">
        <button 
          onClick={onBackClick}
          className="bg-orange-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-orange-600 cursor-pointer transition-colors text-sm sm:text-base"
        >
          <Undo2 />
        </button>
      </div>
    </div>
  );
};

export { 
  AtGlanceComponent, 
  HowItWorksComponent, 
  AssessmentComponent, 
  DashboardComponent, 
  ReportsComponent, 
  KnowledgeHubComponent,
  ContentViewHandler
};