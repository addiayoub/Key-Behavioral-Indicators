import '../style/KBILyticsComponent.css';

// HowItWorksComponent with language switching capability
const HowItWorksComponent = ({ language }) => {
  // Text content based on language
  const content = {
    en: {
      processTitle: "Process Overview",
      processText: "KBIlytics uses a systematic approach to identify, measure, and analyze behavioral indicators within organizations.",
      
      methodologyTitle: "Methodology",
      methodologyText: "Our methodology combines behavioral science, data analytics, and organizational psychology to provide accurate insights into workplace behaviors and attitudes.",
      
      workflowTitle: "Workflow",
      workflowSteps: [
        "Assessment distribution to team members",
        "Data collection and secure storage",
        "AI-powered analysis of behavioral patterns",
        "Report generation with actionable insights",
        "Guidance for implementing change strategies"
      ]
    },
    fr: {
      processTitle: "Présentation du processus",
      processText: "KBIlytics utilise une approche systématique pour identifier, mesurer et analyser les indicateurs comportementaux au sein des organisations.",
      
      methodologyTitle: "Méthodologie",
      methodologyText: "Notre méthodologie combine science du comportement, analyse de données et psychologie organisationnelle pour fournir des informations précises sur les comportements et attitudes au travail.",
      
      workflowTitle: "Flux de travail",
      workflowSteps: [
        "Diffusion des évaluations aux membres de l'équipe",
        "Collecte et stockage sécurisé des données",
        "Analyse des modèles comportementaux par l'IA",
        "Génération de rapports avec des informations exploitables",
        "Conseils pour la mise en œuvre de stratégies de changement"
      ]
    }
  };

  // Select the appropriate content based on language prop
  const currentContent = language === 'fr' ? content.fr : content.en;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.processTitle}</h3>
          <p className="mb-4">
            {currentContent.processText}
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.methodologyTitle}</h3>
          <p className="mb-4">
            {currentContent.methodologyText}
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.workflowTitle}</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {currentContent.workflowSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksComponent;