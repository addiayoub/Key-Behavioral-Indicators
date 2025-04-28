import '../style/KBILyticsComponent.css';

// KnowledgeHubComponent with language switching capability
const KnowledgeHubComponent = ({ language }) => {
  // Text content based on language
  const content = {
    en: {
      backgroundTitle: "Key Behavioral Indicators Background",
      backgroundText: "Key Behavioral Indicators (KBIs) are measurable patterns of behavior that influence organizational success during change initiatives. Unlike traditional KPIs which focus on outcomes, KBIs focus on the human factors that drive those outcomes.",
      
      researchTitle: "Research Findings",
      researchText: "Based on extensive research in organizational psychology and change management, KBIlytics has identified core behavioral categories that significantly impact transformation success:",
      
      behaviorCategories: [
        "Adaptability and resilience",
        "Communication and collaboration",
        "Learning orientation",
        "Initiative and ownership",
        "Leadership and influence"
      ],
      
      bibliographyTitle: "Bibliography",
      bibliographyText: "Our knowledge hub includes several studies/articles from various industries where KBI analysis has led to significant improvements in change initiative outcomes, employee engagement, and organizational agility.",
      bibliographyItems: [
        "Robbins, S.P. & Judge, T.A. (2020). Organizational Behavior, Pearson Education.",
        "Katz, D., & Kahn, R.L. (1966). The Social Psychology of Organizations.",
        "Organ, D. W. (1988). Organizational Citizenship Behavior: The Good Soldier Syndrome.",
        "Perry, R.A. (2023). Behavioral Drivers of Culture.",
        "Jones, J., Butler, J., & Plenert, G. (2022). Transform Behaviors, Transform Results!",
        "Albarracín, D., Fayaz-Farkhad, B., & Granados Samayoa, J. (2022). Determinants of Behaviour, Nature Reviews Psychology.",
        "Dietrich, J-L. (2021). Article sur les KBI – ManagerS en mission.",
        "Harvard Business Review France (2023). \"Comment les KBI transforment la performance\"."
      ]
    },
    fr: {
      backgroundTitle: "Contexte des indicateurs clés de comportement",
      backgroundText: "Les indicateurs clés de comportement (ICC) sont des modèles de comportement mesurables qui influencent la réussite des organisations lors des initiatives de changement. Contrairement aux ICC traditionnels, qui se concentrent sur les résultats, les ICC se concentrent sur les facteurs humains qui les influencent.",
      
      researchTitle: "Résultats de recherche",
      researchText: "S'appuyant sur des recherches approfondies en psychologie organisationnelle et en gestion du changement, KBIlytics a identifié des catégories comportementales clés qui ont un impact significatif sur la réussite des transformations :",
      
      behaviorCategories: [
        "Adaptabilité et résilience",
        "Communication et collaboration",
        "Initiative et appropriation",
        "Leadership et influence"
      ],
      
      bibliographyTitle: "Bibliographie",
      bibliographyText: "Notre centre de connaissances comprend plusieurs études et articles issus de divers secteurs d'activité où l'analyse des ICC a permis d'améliorer significativement les résultats des initiatives de changement, l'engagement des employés et l'agilité organisationnelle.",
      bibliographyItems: [
        "Robbins, S.P. & Judge, T.A. (2020). Organizational Behavior, Pearson Education.",
        "Katz, D., & Kahn, R.L. (1966). The Social Psychology of Organizations.",
        "Organ, D. W. (1988). Organizational Citizenship Behavior: The Good Soldier Syndrome.",
        "Perry, R.A. (2023). Behavioral Drivers of Culture.",
        "Jones, J., Butler, J., & Plenert, G. (2022). Transform Behaviors, Transform Results!",
        "Albarracín, D., Fayaz-Farkhad, B., & Granados Samayoa, J. (2022). Determinants of Behaviour, Nature Reviews Psychology.",
        "Dietrich, J-L. (2021). Article sur les KBI – ManagerS en mission.",
        "Harvard Business Review France (2023). \"Comment les KBI transforment la performance\"."
      ]
    }
  };

  // Select the appropriate content based on language prop
  const currentContent = language === 'fr' ? content.fr : content.en;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.backgroundTitle}</h3>
          <p className="mb-4">
            {currentContent.backgroundText}
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.researchTitle}</h3>
          <p className="mb-4">
            {currentContent.researchText}
          </p>
          <ul className="space-y-2 mb-4">
            {currentContent.behaviorCategories.map((category, index) => (
              <li key={index}>• {category}</li>
            ))}
          </ul>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">{currentContent.bibliographyTitle}</h3>
          <p className="mb-4">
            {currentContent.bibliographyText}
          </p>
          <div className="space-y-2 italic text-gray-300">
            {currentContent.bibliographyItems.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubComponent;