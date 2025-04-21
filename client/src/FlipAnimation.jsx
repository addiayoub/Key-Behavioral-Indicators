import { useState, useEffect } from 'react';

export default function FlipAnimation() {
  const [isFlipping, setIsFlipping] = useState(true);
  
  // Optionnel: ajouter un contrôle pour démarrer/arrêter l'animation
  const toggleFlip = () => {
    setIsFlipping(!isFlipping);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-8">
        <img 
          src="/Picture12.png" 
          alt="Icône d'analyse" 
          className={`w-full ${isFlipping ? 'animate-flip' : ''}`}
          style={{
            filter: 'invert(50%) sepia(87%) saturate(2950%) hue-rotate(360deg) brightness(100%) contrast(99%)',
            animation: isFlipping ? 'flip 3s infinite ease-in-out' : 'none'
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes flip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}