// DashboardComponent.jsx
import '../style/KBILyticsComponent.css';

const DashboardComponent = ({ language }) => {
  // Translations for dashboard content
  const content = {
    en: {
      featuresTitle: "Dashboard Features",
      featuresDescription: "The KBIlytics dashboard provides a comprehensive overview of your organization's behavioral indicators, with intuitive navigation and real-time data visualization.",
      keyFeaturesTitle: "Key Features",
      keyFeatures: [
        "Interactive data visualizations",
        "Customizable views based on departments or teams",
        "Real-time updates as assessment data comes in",
        "Trend tracking over time",
        "Quick access to detailed reports"
      ],
      navTipsTitle: "Navigation Tips",
      navTipsDescription: "The dashboard is designed for intuitive use with filters, sorting options, and drill-down capabilities to explore data at different levels of granularity."
    },
    fr: {
      featuresTitle: "Fonctionnalités du Tableau de Bord",
      featuresDescription: "Le tableau de bord KBIlytics offre une vue d'ensemble complète des indicateurs comportementaux de votre organisation, avec une navigation intuitive et une visualisation des données en temps réel.",
      keyFeaturesTitle: "Caractéristiques Principales",
      keyFeatures: [
        "Visualisations de données interactives",
        "Vues personnalisables basées sur les départements ou les équipes",
        "Mises à jour en temps réel à mesure que les données d'évaluation arrivent",
        "Suivi des tendances dans le temps",
        "Accès rapide aux rapports détaillés"
      ],
      navTipsTitle: "Conseils de Navigation",
      navTipsDescription: "Le tableau de bord est conçu pour une utilisation intuitive avec des filtres, des options de tri et des capacités d'exploration pour analyser les données à différents niveaux de granularité."
    }
  };

  // Select language content
  const t = language === 'fr' ? content.fr : content.en;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{t.featuresTitle}</h3>
          <p className="mb-4">
            {t.featuresDescription}
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{t.keyFeaturesTitle}</h3>
          <ul className="space-y-2">
            {t.keyFeatures.map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
          
          <h3 className="text-xl font-semibold text-orange-500 mt-6 mb-4">{t.navTipsTitle}</h3>
          <p>
            {t.navTipsDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;