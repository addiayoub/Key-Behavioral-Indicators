import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../../style/KBILyticsComponent.css';
import EmployeeAssessmentCategoriesComponent from './EmployeeAssessmentCategoriesComponent';
import AssessmentCategoriesComponent from './AssessmentCategoriesComponent'; // Ajouté pour les invités
import ApiService from '../ApiService';
import Swal from 'sweetalert2';

const AssessmentComponent = ({ language }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

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
      participateButton: "Participer en tant qu'entreprise",
      loginError: "Erreur de connexion",
      invalidCredentials: "Identifiants invalides",
      serverError: "Erreur serveur, veuillez réessayer",
      successLogin: "Connexion réussie !",
      logout: "Déconnexion"
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
      participateButton: "Participate as company",
      loginError: "Login error",
      invalidCredentials: "Invalid credentials",
      serverError: "Server error, please try again",
      successLogin: "Login successful!",
      logout: "Logout"
    }
  };

  const t = translations[language] || translations.fr;

  const getCompanyLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
  };

  const handleEmployeeLogin = async () => {
    try {
      setError('');
      const response = await ApiService.employeeLogin({ login, password });
      if (response.success) {
        setUserData({
          type: 'employee',
          id: response.client._id,
          token: response.token,
          companyName: response.client.companyName,
          companyLogo: response.client.logo
        });
        Swal.fire({
          title: t.successLogin,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          setShowCategories(true);
        });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.response?.data?.message || t.serverError);
      Swal.fire({
        title: t.loginError,
        text: error.response?.data?.message || t.serverError,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleTestClick = () => {
    setUserData({ type: 'guest' });
    setShowCategories(true);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option !== 'test') {
      setShowCategories(false);
    }
  };

  const handleLogout = () => {
    setUserData(null);
    setSelectedOption(null);
    setShowCategories(false);
    setLogin('');
    setPassword('');
    setError('');
  };

  useEffect(() => {
    const handleReturnToMenu = () => {
      handleLogout();
    };
    window.addEventListener('returnToMenu', handleReturnToMenu);
    return () => window.removeEventListener('returnToMenu', handleReturnToMenu);
  }, []);

  return (
    <div className="w-full h-full flex flex-col text-white">
      {!showCategories ? (
        <>
          <div className="mb-6">
            <p className="text-lg text-white mb-2">{t.introduction}</p>
            <p className="text-lg text-white mb-2">{t.section1}</p>
            <p className="text-lg text-white mb-2">{t.section2to6}</p>
          </div>

          <div className="flex flex-col space-y-8 mt-4">
            <div
              id='Landing_page_view'
              className="partciper flex items-center cursor-pointer"
              onClick={() => handleOptionClick('test')}
            >
              <div className="flex-shrink-0 mr-4">
                <div className="text-orange-600 w-10 h-10 flex items-center justify-center">
                  {selectedOption === 'test' ? <BookmarkCheck /> : <Bookmark />}
                </div>
              </div>
              <div className="flex-1 text-lg">{t.individualOption}</div>
              {selectedOption === 'test' && (
                <button
                  onClick={handleTestClick}
                  id='demarrer'
                  className="w-full sm:w-auto px-6 py-3 rounded-lg text-center transition-colors text-base sm:text-lg animate-fadeIn"
                >
                  {t.testButton}
                </button>
              )}
            </div>

            <div className="relative">
              <div
                className="flex partciper items-center cursor-pointer"
                onClick={() => handleOptionClick('participate')}
              >
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 flex items-center justify-center text-orange-600">
                    {selectedOption === 'participate' ? <BookmarkCheck /> : <Bookmark />}
                  </div>
                </div>
                <div className={`flex-1 text-lg ${selectedOption === 'participate' ? 'opacity-20' : 'opacity-100'} transition-opacity duration-300`}>
                  {t.companyOption}
                </div>
              </div>

              {selectedOption === 'participate' && (
                <div id='Landing_page_view' className="absolute inset-0 flex items-center animate-slideDown">
                  <div className="flex-shrink-0 mr-4 w-10"></div>
                  <div className="flex-1 space-y-4">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        placeholder={t.loginPlaceholder}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-white rounded-lg bg-transparent text-white focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder={t.passwordPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-white rounded-lg bg-transparent text-white focus:outline-none"
                      />
                      <button
                        onClick={handleEmployeeLogin}
                        id='demarrer'
                        className="px-6 py-3 rounded-lg text-center transition-colors text-base sm:text-lg whitespace-nowrap"
                      >
                        {t.participateButton}
                      </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col">
          {userData?.type === 'employee' && (
            <div className="company-bar flex items-center justify-between bg-gray-800 p-4 mb-4 rounded-lg">
              <div className="flex items-center">
                {userData.companyLogo && (
                  <img 
                    src={getCompanyLogoUrl(userData.companyLogo)} 
                    alt="Company Logo" 
                    className="w-10 h-10 mr-3 rounded object-contain"
                    onError={(e) => {
                      console.error('Erreur de chargement du logo:', userData.companyLogo);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-lg font-semibold">
                  {userData.companyName}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                {t.logout}
              </button>
            </div>
          )}
          {userData?.type === 'employee' ? (
            <EmployeeAssessmentCategoriesComponent
              language={language}
              onReturnToMenu={handleLogout}
              userData={userData}
            />
          ) : (
            <AssessmentCategoriesComponent
              language={language}
              onReturnToMenu={handleLogout}
              userData={userData}
            />
          )}
        </div>
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