import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';

const ClientModal = ({ showModal, setShowModal, editingItem, reloadData, apiRequest, authToken }) => {
  const [form, setForm] = useState({
    companyName: '',
    logo: '',
    adminLogin: '',
    adminPassword: '',
    employeeLogin: '',
    employeePassword: '',
    maxEmployees: 10
  });
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fonction pour construire l'URL complète du logo
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return '';
    
    // Si c'est déjà une URL complète ou une data URL, la retourner telle quelle
    if (logoPath.startsWith('http') || logoPath.startsWith('data:')) {
      return logoPath;
    }
    
    // Construire l'URL complète avec l'API URL
    const apiUrl = import.meta.env.VITE_API_URL ;
    return `${apiUrl}${logoPath.startsWith('/') ? logoPath : '/' + logoPath}`;
  };

  useEffect(() => {
    if (editingItem) {
      setForm({
        companyName: editingItem.companyName || '',
        logo: editingItem.logo || '',
        adminLogin: editingItem.admin?.login || '',
        adminPassword: '',
        employeeLogin: editingItem.employeeAccess?.login || '',
        employeePassword: '',
        maxEmployees: editingItem.maxEmployees || 10
      });
    } else {
      setForm({
        companyName: '',
        logo: '',
        adminLogin: '',
        adminPassword: '',
        employeeLogin: '',
        employeePassword: '',
        maxEmployees: 10
      });
    }
    setLogoFile(null);
    setUploadProgress(0);
  }, [editingItem]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification du type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Seuls les fichiers image (JPG, PNG, GIF, WebP) sont autorisés');
        return;
      }
      
      // Vérification de la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier doit faire moins de 10MB');
        return;
      }
      
      setLogoFile(file);
      
      // Preview de l'image
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getAuthToken = () => {
    // Essayer plusieurs sources pour récupérer le token
    if (authToken) {
      return authToken;
    }
    
    // Depuis localStorage - AJOUT de adminToken
    const localToken = localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
    if (localToken) {
      return localToken;
    }
    
    // Depuis sessionStorage - AJOUT de adminToken
    const sessionToken = sessionStorage.getItem('adminToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (sessionToken) {
      return sessionToken;
    }
    
    // Depuis les cookies si nécessaire
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'adminToken' || name === 'token' || name === 'authToken') {
        return value;
      }
    }
    
    return null;
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;
    
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token d\'authentification non trouvé');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/admin/clients/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Ne pas définir Content-Type pour FormData
        },
        body: formData
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorisé - Veuillez vous reconnecter');
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const uploadResponse = await response.json();
      return uploadResponse.logo;
    } catch (error) {
      console.error('Erreur upload logo:', error);
      throw error; // Relancer l'erreur avec le message original
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      setUploadProgress(10);
      
      let logoUrl = form.logo;
      
      // Upload du logo si un nouveau fichier a été sélectionné
      if (logoFile) {
        setUploadProgress(30);
        try {
          logoUrl = await uploadLogo();
          setUploadProgress(60);
        } catch (uploadError) {
          // Si l'upload échoue, on peut continuer sans logo ou afficher l'erreur
          if (uploadError.message.includes('Non autorisé')) {
            alert('Session expirée. Veuillez vous reconnecter.');
            return;
          }
          throw uploadError;
        }
      }
      
      // Préparer les données du formulaire
      const clientData = {
        ...form,
        logo: logoUrl
      };
      
      // Sauvegarder les données du client
      setUploadProgress(80);
      if (editingItem) {
        await apiRequest(`/admin/clients/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(clientData)
        });
      } else {
        await apiRequest('/admin/clients', {
          method: 'POST',
          body: JSON.stringify(clientData)
        });
      }
      
      setUploadProgress(100);
      setShowModal(false);
      reloadData();
    } catch (error) {
      console.error('Erreur sauvegarde client:', error);
      alert(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeLogo = () => {
    setForm(prev => ({ ...prev, logo: '' }));
    setLogoFile(null);
  };

  // Fonction pour gérer les erreurs d'image
  const handleImageError = (e) => {
    console.error('Erreur de chargement de l\'image:', e.target.src);
    // Optionnel: afficher une image par défaut
    // e.target.src = '/path/to/default-logo.png';
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !uploading && setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {editingItem ? 'Modifier Client' : 'Nouveau Client'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => !uploading && setShowModal(false)}
                  disabled={uploading}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Barre de progression */}
              {uploading && (
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Logo de l'entreprise
                  </label>
                  <div className="flex items-center gap-4">
                    {form.logo && (
                      <div className="relative">
                        <img 
                          src={getLogoUrl(form.logo)} 
                          alt="Logo de l'entreprise" 
                          className="w-20 h-20 rounded-lg object-cover border border-gray-600 shadow-lg"
                          onError={handleImageError}
                          onLoad={() => console.log('Image chargée avec succès:', getLogoUrl(form.logo))}
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          disabled={uploading}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 shadow-lg disabled:opacity-50"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                    <label className="flex-1">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-gray-600 hover:border-orange-500">
                        <Upload className="h-5 w-5 text-orange-500" />
                        <span className="text-gray-300">
                          {form.logo ? 'Changer le logo' : 'Uploader un logo'}
                        </span>
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          accept="image/*"
                          disabled={uploading}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Formats acceptés : JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                  {/* Debug info - À supprimer en production */}
                  {form.logo && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Debug - URL du logo: {getLogoUrl(form.logo)}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({...form, companyName: e.target.value})}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    required
                    placeholder="Ex: Mon Entreprise SARL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre max d'employés *
                  </label>
                  <input
                    type="number"
                    value={form.maxEmployees}
                    onChange={(e) => setForm({...form, maxEmployees: parseInt(e.target.value) || 10})}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    min="1"
                    max="1000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Login Admin *
                  </label>
                  <input
                    type="text"
                    value={form.adminLogin}
                    onChange={(e) => setForm({...form, adminLogin: e.target.value})}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    required
                    placeholder="admin@entreprise.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mot de passe Admin {editingItem ? '' : '*'}
                  </label>
                  <input
                    type="password"
                    value={form.adminPassword}
                    onChange={(e) => setForm({...form, adminPassword: e.target.value})}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    required={!editingItem}
                    placeholder={editingItem ? "Laisser vide pour ne pas changer" : "Mot de passe sécurisé"}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Login Employé *
                  </label>
                  <input
                    type="text"
                    value={form.employeeLogin}
                    onChange={(e) => setForm({...form, employeeLogin: e.target.value})}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    required
                    placeholder="employe@entreprise.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mot de passe Employé {editingItem ? '' : '*'}
                  </label>
                  <input
                    type="password"
                    value={form.employeePassword}
                    onChange={(e) => setForm({...form, employeePassword: e.target.value})}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    required={!editingItem}
                    placeholder={editingItem ? "Laisser vide pour ne pas changer" : "Mot de passe sécurisé"}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex-1 ${
                    uploading 
                      ? 'bg-orange-600 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  } text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      {uploadProgress < 100 ? `${uploadProgress}%` : 'Finalisation...'}
                    </>
                  ) : (
                    <>
                      {editingItem ? 'Modifier le client' : 'Créer le client'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClientModal;