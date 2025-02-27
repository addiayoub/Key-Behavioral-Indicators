import React from 'react';
import { Globe } from 'lucide-react';
import './LanguageSwitcher.css';

const LanguageSwitcher = ({ language, setLanguage }) => {
  return (
    <div className="language-switcher">
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
        <Globe size={18} className="text-gray-300" />
        <div className="flex rounded overflow-hidden">
          <button
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              language === 'fr' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setLanguage('fr')}
          >
            FR
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              language === 'en' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;