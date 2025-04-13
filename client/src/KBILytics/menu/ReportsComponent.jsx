// AtGlanceComponent.jsx
import '../style/KBILyticsComponent.css';


// ReportsComponent.jsx

const ReportsComponent = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Understanding Your Assessment Results</h3>
          <p className="mb-4">
            KBIlytics reports provide detailed analysis of assessment data, highlighting behavioral patterns, potential areas of resistance to change, and recommendations for improvement.
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Analytics and Trends</h3>
          <p className="mb-4">
            Our reports include comparative analytics across departments, teams, and industry benchmarks. Trend analysis shows changes in behaviors over time and in response to organizational initiatives.
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">AI-Driven Insights</h3>
          <p>
            Using advanced AI algorithms, KBIlytics identifies correlations and patterns that might not be immediately apparent. These insights help predict potential challenges in change management and suggest targeted interventions based on behavioral science research.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsComponent