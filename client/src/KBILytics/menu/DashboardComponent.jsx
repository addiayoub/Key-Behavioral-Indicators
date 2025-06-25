// DashboardComponent.jsx
import React from 'react';
import '../style/KBILyticsComponent.css';
import { motion } from 'framer-motion';
import { Brain, Users, MessageCircle, ArrowLeftRight, TrendingUp } from 'lucide-react';

const DashboardComponent = ({ language }) => {
  // Translations for dashboard content
  const content = {
    en: {
      title: "Psychological Research: Scientific Foundation of the KBIlytics Assessment",
      description: "KBIlytics is not just a behavioral tool, but a scientifically grounded framework that draws upon validated research across organizational behavior, psychology, and learning science. Each question in the assessment is mapped to one or more of these theoretical pillars — bringing clarity and credibility to the behavioral metrics used.",
      tableHeaders: [
        "KBI",
        "Behavioral Focus Areas",
        "Supporting Psychological Theories & Concepts",
        "Example Scholars / Sources"
      ],
      tableData: [
        {
          kbi: "Proactivity",
          icon: <TrendingUp className="text-orange-500" size={40} />,
          areas: "Initiative, problem-solving, decision-making",
          theories: "Self-Determination Theory, Locus of Control, Goal Orientation",
          sources: "Deci & Ryan, Bandura, Locke & Latham"
        },
        {
          kbi: "Collaboration",
          icon: <Users className="text-orange-500" size={40} />,
          areas: "Teamwork, trust, conflict resolution, communication",
          theories: "Social Interdependence Theory, Psychological Safety, Group Dynamics",
          sources: "Tuckman, Edmondson, Deutsch"
        },
        {
          kbi: "Openness to Feedback",
          icon: <MessageCircle className="text-orange-500" size={40} />,
          areas: "Receptiveness, emotional intelligence, growth mindset",
          theories: "Feedback Intervention Theory, Emotional Regulation, Growth Mindset",
          sources: "Kluger & DeNisi, Dweck, Goleman"
        },
        {
          kbi: "Adaptability",
          icon: <ArrowLeftRight className="text-orange-500" size={40} />,
          areas: "Change acceptance, resilience, cognitive flexibility",
          theories: "Stress Appraisal Theory, Learning Agility, Tolerance of Ambiguity",
          sources: "Lazarus & Folkman, Pulakos, Fredrickson"
        },
        {
          kbi: "Continuous Improvement",
          icon: <Brain className="text-orange-500" size={40} />,
          areas: "Innovation, lifelong learning, error-based learning",
          theories: "Kaizen Principles, Organizational Learning Theory, Self-Directed Learning",
          sources: "Imai, Senge, Knowles"
        }
      ]
    },
    fr: {
      title: "Recherche psychologique : Fondement Scientifique de l'Évaluation KBIlytics",
      description: "KBIlytics n'est pas simplement un outil comportemental, mais bien un cadre rigoureux et scientifique, fondé sur des recherches validées en psychologie, management et sciences de l'apprentissage. Chaque question du questionnaire est liée à un ou plusieurs de ces fondements théoriques, assurant la crédibilité, la rigueur et la valeur actionnable des indicateurs comportementaux mesurés.",
      tableHeaders: [
        "KBI",
        "Axes Comportementaux Clés",
        "Théories Psychologiques et Concepts Associés",
        "Références / Chercheurs"
      ],
      tableData: [
        {
          kbi: "Proactivité",
          icon: <TrendingUp className="text-orange-500" size={40} />,
          areas: "Initiative, résolution de problèmes, prise de décision",
          theories: "Théorie de l'autodétermination, Locus de contrôle, Orientation vers les objectifs",
          sources: "Deci & Ryan, Bandura, Locke & Latham"
        },
        {
          kbi: "Collaboration",
          icon: <Users className="text-orange-500" size={40} />,
          areas: "Travail d'équipe, confiance, résolution de conflits, communication",
          theories: "Théorie de l'interdépendance sociale, Sécurité psychologique, Dynamiques de groupe",
          sources: "Tuckman, Edmondson, Deutsch"
        },
        {
          kbi: "Ouverture au Feedback",
          icon: <MessageCircle className="text-orange-500" size={40} />,
          areas: "Réceptivité, intelligence émotionnelle, état d'esprit de développement",
          theories: "Théorie de l'intervention par le feedback, Régulation émotionnelle, Growth Mindset",
          sources: "Kluger & DeNisi, Dweck, Goleman"
        },
        {
          kbi: "Adaptabilité",
          icon: <ArrowLeftRight className="text-orange-500" size={40} />,
          areas: "Acceptation du changement, résilience, flexibilité cognitive",
          theories: "Théorie de l'évaluation du stress, Agilité d'apprentissage, Tolérance à l'ambiguïté",
          sources: "Lazarus & Folkman, Pulakos, Fredrickson"
        },
        {
          kbi: "Amélioration Continue",
          icon: <Brain className="text-orange-500" size={40} />,
          areas: "Innovation, apprentissage continu, apprentissage par l'erreur",
          theories: "Principes Kaizen, Théorie de l'apprentissage organisationnel, Autoformation",
          sources: "Imai, Senge, Knowles"
        }
      ]
    }
  };

  // Select language content
  const t = language === 'fr' ? content.fr : content.en;

  return (
    <div className="w-full h-full flex flex-col" style={{ 
      isolation: 'isolate', 
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div className="w-full border border-white rounded-2xl p-4 sm:p-6 lg:p-10 border_content">
        <div className="text-sm sm:text-base lg:text-lg text-white">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-500 mb-4">
            {t.title}
          </h3>
          <p className="mb-6 leading-relaxed">
            {t.description}
          </p>
          
          {/* Version Desktop/Tablette - Tableau classique */}
          <div className="hidden md:block overflow-x-auto" style={{ 
            willChange: 'auto', 
            transform: 'translateZ(0)',
            contain: 'layout style paint',
            overflow: 'hidden'
          }}>
            <table className="w-full border-collapse min-w-[800px]" style={{ backfaceVisibility: 'hidden' }}>
              <thead>
                <tr className="bg-gray-800">
                  {t.tableHeaders.map((header, index) => (
                    <th 
                      key={index} 
                      className="p-3 text-left border-b border-orange-500 text-orange-500 text-sm lg:text-base"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.tableData.map((row, index) => (
                  <tr 
                    key={index}
                    className="border-b border-gray-700 hover:bg-orange-500/10 transition-transform duration-200 ease-in-out hover:scale-[1.01] origin-center"
                    style={{ transformOrigin: 'center', contain: 'layout style paint' }}
                  >
                    <td className="p-3 flex items-center">
                      <div className="flex-shrink-0">
                        {React.cloneElement(row.icon, { size: 32 })}
                      </div>
                      <span className="ml-2 font-medium text-sm lg:text-base">{row.kbi}</span>
                    </td>
                    <td className="p-3 text-sm lg:text-base">{row.areas}</td>
                    <td className="p-3 text-sm lg:text-base">{row.theories}</td>
                    <td className="p-3 text-sm lg:text-base">{row.sources}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version Mobile - Cards */}
          <div className="md:hidden space-y-4">
            {t.tableData.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-orange-500/50 transition-colors duration-200"
              >
                {/* En-tête de la card */}
                <div className="flex items-center mb-3 pb-3 border-b border-gray-700">
                  <div className="flex-shrink-0">
                    {React.cloneElement(row.icon, { size: 28 })}
                  </div>
                  <h4 className="ml-3 text-lg font-semibold text-orange-500">
                    {row.kbi}
                  </h4>
                </div>

                {/* Contenu de la card */}
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-orange-400 mb-1">
                      {t.tableHeaders[1]}
                    </h5>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {row.areas}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-orange-400 mb-1">
                      {t.tableHeaders[2]}
                    </h5>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {row.theories}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-orange-400 mb-1">
                      {t.tableHeaders[3]}
                    </h5>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {row.sources}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;