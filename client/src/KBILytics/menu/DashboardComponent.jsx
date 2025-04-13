// AtGlanceComponent.jsx
import '../style/KBILyticsComponent.css';



 
// DashboardComponent.jsx

const DashboardComponent = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full border border-white rounded-2xl p-8 border_content">
        <div className="text-lg text-white">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Dashboard Features</h3>
          <p className="mb-4">
            The KBIlytics dashboard provides a comprehensive overview of your organization's behavioral indicators, with intuitive navigation and real-time data visualization.
          </p>
          
          <h3 className="text-xl font-semibold text-orange-500 mb-4">Key Features</h3>
          <ul className="space-y-2">
            <li>• Interactive data visualizations</li>
            <li>• Customizable views based on departments or teams</li>
            <li>• Real-time updates as assessment data comes in</li>
            <li>• Trend tracking over time</li>
            <li>• Quick access to detailed reports</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-orange-500 mt-6 mb-4">Navigation Tips</h3>
          <p>
            The dashboard is designed for intuitive use with filters, sorting options, and drill-down capabilities to explore data at different levels of granularity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent