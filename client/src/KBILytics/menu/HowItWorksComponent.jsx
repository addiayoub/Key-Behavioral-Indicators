// AtGlanceComponent.jsx
import '../style/KBILyticsComponent.css';

// HowItWorksComponent.jsx

const HowItWorksComponent = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Process Overview</h3>
          <p className="mb-4">
            KBIlytics uses a systematic approach to identify, measure, and analyze behavioral indicators within organizations.
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Methodology</h3>
          <p className="mb-4">
            Our methodology combines behavioral science, data analytics, and organizational psychology to provide accurate insights into workplace behaviors and attitudes.
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Workflow</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Assessment distribution to team members</li>
            <li>Data collection and secure storage</li>
            <li>AI-powered analysis of behavioral patterns</li>
            <li>Report generation with actionable insights</li>
            <li>Guidance for implementing change strategies</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksComponent