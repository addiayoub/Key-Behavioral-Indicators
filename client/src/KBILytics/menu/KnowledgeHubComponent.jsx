// AtGlanceComponent.jsx
import '../style/KBILyticsComponent.css';


// KnowledgeHubComponent.jsx

const KnowledgeHubComponent = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Key Behavioral Indicators Background</h3>
          <p className="mb-4">
            Key Behavioral Indicators (KBIs) are measurable patterns of behavior that influence organizational success during change initiatives. Unlike traditional KPIs which focus on outcomes, KBIs focus on the human factors that drive those outcomes.
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Research Findings</h3>
          <p className="mb-4">
            Based on extensive research in organizational psychology and change management, KBIlytics has identified core behavioral categories that significantly impact transformation success:
          </p>
          <ul className="space-y-2 mb-4">
            <li>• Adaptability and resilience</li>
            <li>• Communication and collaboration</li>
            <li>• Learning orientation</li>
            <li>• Initiative and ownership</li>
            <li>• Leadership and influence</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Case Studies</h3>
          <p>
            Our knowledge hub includes detailed case studies from various industries where KBI analysis has led to significant improvements in change initiative outcomes, employee engagement, and organizational agility.
          </p>
        </div>
      </div>
    </div>
  );
};
export default KnowledgeHubComponent