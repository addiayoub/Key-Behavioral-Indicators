// App.js
import { useState, useEffect } from 'react';
import './App.css';
import KBILyticsComponent from './KBILytics/KBILyticsComponent ';
import FlipAnimation from './FlipAnimation';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 secondes d'animation avant d'afficher le composant principal

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <FlipAnimation />
      ) : (
        <KBILyticsComponent />
      )}
    </>
  );
}

export default App;
