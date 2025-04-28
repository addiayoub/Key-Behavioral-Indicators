import '../style/KBILyticsComponent.css';

// ReportsComponent with language switching capability
const ReportsComponent = ({ language }) => {
  // Text content based on language
  const content = {
    en: {
      resultsTitle: "Understanding Your Assessment Results",
      resultsText: "KBIlytics reports provide detailed analysis of assessment data, highlighting behavioral patterns, potential areas of resistance to change, and recommendations for improvement.",
      
      analyticsTitle: "Analytics and Trends",
      analyticsText: "Our reports include comparative analytics across departments, teams, and industry benchmarks. Trend analysis shows changes in behaviors over time and in response to organizational initiatives.",
      
      insightsTitle: "AI-Driven Insights",
      insightsText: "Using advanced AI algorithms, KBIlytics identifies correlations and patterns that might not be immediately apparent. These insights help predict potential challenges in change management and suggest targeted interventions based on behavioral science research."
    },
    fr: {
      resultsTitle: "Comprendre les résultats de votre évaluation",
      resultsText: "Les rapports KBIlytics fournissent une analyse détaillée des données d'évaluation, mettant en évidence les schémas comportementaux, les points de résistance potentiels au changement et les recommandations d'amélioration.",
      
      analyticsTitle: "Analyses et tendances",
      analyticsText: "Nos rapports incluent des analyses comparatives entre services, équipes et référentiels sectoriels. L'analyse des tendances montre l'évolution des comportements au fil du temps et en réponse aux initiatives organisationnelles.",
      
      insightsTitle: "Informations basées sur l'IA",
      insightsText: "Grâce à des algorithmes d'IA avancés, KBIlytics identifie des corrélations et des schémas qui peuvent ne pas être immédiatement apparents. Ces informations permettent d'anticiper les défis potentiels de la gestion du changement et de suggérer des interventions ciblées basées sur des recherches en sciences du comportement."
    }
  };

  // Select the appropriate content based on language prop
  const currentContent = language === 'fr' ? content.fr : content.en;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.resultsTitle}</h3>
          <p className="mb-4">
            {currentContent.resultsText}
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.analyticsTitle}</h3>
          <p className="mb-4">
            {currentContent.analyticsText}
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.insightsTitle}</h3>
          <p>
            {currentContent.insightsText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsComponent;