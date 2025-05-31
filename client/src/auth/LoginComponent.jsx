import { motion } from 'framer-motion';
import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';

const LoginComponent = () => {
  const [userType, setUserType] = useState('admin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="bg-black py-6 px-8">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <span className="text-purple-400">KBI</span>-LYTICS
          </h1>
        </div>

        <Tabs 
          value={userType}
          onChange={(e, val) => setUserType(val)}
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="inherit"
          className="border-b border-gray-100"
        >
          <Tab label="Admin" value="admin" className="font-medium" />
          <Tab label="Client" value="client" className="font-medium" />
          <Tab label="Employé" value="employee" className="font-medium" />
        </Tabs>

        <motion.div 
          key={userType}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-8"
        >
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input 
                type="password" 
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
            >
              Se connecter
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default LoginComponent;