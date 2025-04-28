import '../style/KBILyticsComponent.css';

const AtGlanceComponent = ({ language }) => {
  // Text content based on language
  const content = {
    en: {
      intro: "Rather than reacting to people's attitudes and behaviors during a project, organizations can proactively assess and map behavioral trends within the company. By leveraging this factual understanding, businesses can develop a tailored change management plan before or during a digital or organizational transformation. This approach enhances the likelihood of achieving successful and sustainable outcomes.",
      
      title: "WHY THE KBI?",
      
      point1Title: "1. To Go Beyond the Numbers",
      point1: "KBIs fill that gap by measuring the behaviors that drive those results, such as collaboration, adaptability, and initiative.",
      quote: "\"What gets measured, gets managed. What gets observed, gets understood.\"",
      
      point2Title: "2. To Strengthen Culture and Values",
      point2: "KBIs are powerful tools to align employee behavior with organizational culture, values, and vision. They help reinforce the \"soft\" elements that define a company's identity — trust, respect, communication, and ethical conduct.",
      example: "Example: Google uses KBIs to promote innovation and cross-team collaboration — values that are core to its DNA.",
      
      point3Title: "3. To Complement KPIs, Not Replace Them",
      point3: "While KPIs measure performance outcomes, KBIs measure performance enablers. Together, they offer a more holistic view of success:",
      point3Add: "KBIs help predict future success, while KPIs reflect the past.",
      
      point4Title: "4. To Enable Continuous Improvement",
      point4: "By tracking behaviors over time, managers can detect patterns, give timely feedback, and develop training plans. KBIs allow teams to improve before a problem appears in the KPIs.",
      
      point5Title: "5. To Humanize Performance Management",
      point5: "In a world shifting toward well-being, inclusion, and engagement, KBIs put the spotlight on the human side of performance. They Reduce toxic behaviors, Encourage psychological safety, and Recognize effort, not just results.",
      highlight: "✨ A workplace that tracks and values healthy behaviors builds sustainable success.",
      
      conclusion: "In short, KBI = Performance through People. They help you build a team that doesn't just do things right, but does the right things — together."
    },
    fr: {
      intro: "Plutôt que de réagir aux attitudes et comportements des individus pendant un projet, les organisations peuvent évaluer et cartographier proactivement les tendances comportementales au sein de l'entreprise. En s'appuyant sur cette compréhension factuelle, elles peuvent élaborer un plan de gestion du changement sur mesure avant ou pendant une transformation numérique ou organisationnelle. Cette approche augmente les chances d'obtenir des résultats positifs et durables.",
      
      title: "POURQUOI LES KBI (indicateurs comportmentaux clés) ?",
      
      point1Title: "1. Au-delà des chiffres",
      point1: "Ces indicateurs clés comblent le gap avec les KPI en mesurant les comportements qui génèrent ces résultats, tels que la collaboration, l'adaptabilité et l'initiative.",
      quote: "« Ce qui est mesuré est géré. Ce qui est observé est compris.»",
      
      point2Title: "2. Renforcer la culture et les valeurs",
      point2: "Les KBI sont des outils puissants pour aligner le comportement des employés avec la culture, les valeurs et la vision de l'organisation. Ils contribuent à renforcer les éléments « intangibles » qui définissent l'identité d'une entreprise : la confiance, le respect, la communication et l'éthique.",
      example: "",
      
      point3Title: "3. Compléter les KPI, et non les remplacer",
      point3: "Alors que les indicateurs clés de performance mesurent les résultats, les indicateurs clés de performance mesurent les facteurs de performance. Ensemble, ils offrent une vision plus globale de la réussite :",
      point3Add: "les KBI permettent de prédire la réussite future, tandis que les KPI reflètent la performance dans le passé.",
      
      point4Title: "4. Favoriser l'amélioration continue",
      point4: "En suivant les comportements au fil du temps, les managers peuvent identifier des tendances, fournir un feedback pertinent et élaborer des plans de formation. Les KBI permettent aux équipes de s'améliorer avant qu'un problème n'apparaisse dans les KPI.",
      
      point5Title: "5. Humaniser la gestion de la performance",
      point5: "Dans un monde en pleine évolution vers le bien-être, l'inclusion et l'engagement, les KBI mettent en avant l'aspect humain de la performance. Ils réduisent les comportements toxiques, favorisent la sécurité psychologique et reconnaissent les efforts, et pas seulement les résultats.",
      highlight: "✨ Un environnement de travail qui suit et valorise les comportements sains favorise la réussite durable.",
      
      conclusion: "En bref, KBI = Performance par les Personnes. Ils vous aident à constituer une équipe qui non seulement fait bien les choses, mais qui les fait aussi bien, ensemble."
    }
  };

  const currentContent = language === 'fr' ? content.fr : content.en;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content mb-6">

        <p className="text-lg text-white">
          {currentContent.intro}
        </p>
      
      
      <div className="w-full  rounded-2xl pt-5 border_content">
        
      
          <h3 className="text-xl font-semibold text-orange-500">{currentContent.point1Title}</h3>
          <p className="text-lg text-white">{currentContent.point1}</p>
          <p className="text-lg text-white italic my-2">{currentContent.quote}</p>
        
      
          <h3 className="text-xl font-semibold text-orange-500 ">{currentContent.point2Title}</h3>
          <p className="text-lg text-white pt-2">{currentContent.point2}</p>
          {currentContent.example && <p className="text-lg text-white my-2">{currentContent.example}</p>}
        
      
          <h3 className="text-xl font-semibold text-orange-500 my-2">{currentContent.point3Title}</h3>
          <p className="text-lg text-white">{currentContent.point3}</p>
          <p className="text-lg text-white my-2">{currentContent.point3Add}</p>
        
      
          <h3 className="text-xl font-semibold text-orange-500 my-2">{currentContent.point4Title}</h3>
          <p className="text-lg text-white">{currentContent.point4}</p>
        
      
          <h3 className="text-xl font-semibold text-orange-500 my-2">{currentContent.point5Title}</h3>
          <p className="text-lg text-white">{currentContent.point5}</p>
          <p className="text-xl font-semibold text-orange-500 my-2">{currentContent.highlight}</p>
        
        <p className="text-lg text-white font-bold mt-4">{currentContent.conclusion}</p>
      </div>
      </div>
    </div>
  );
};

export default AtGlanceComponent;