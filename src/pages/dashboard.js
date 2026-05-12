import React, { useState, useEffect } from 'react';
import useDashboard from '../hooks/usedashboard';
import DashboardCards from '../components/dashboard/dashboardcards';
import CategoryBreakdown from '../components/dashboard/categorybreakdown';
import EmissionChart from '../components/dashboard/emissionchart';
import AlertMissigCategory from '../components/alertmissingcategories'

const Dashboard = () => {
  const { data, loading } = useDashboard();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="w-full max-w-7xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-300 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">Please check your API connection or add emission data first.</p>
          <a href="/emissioncalc" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Go to Emission Calculator
          </a>
        </div>
      </div>
    );
  }

  if (data.isEmpty) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <svg className="w-20 h-20 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to GHG Tracker!</h1>
            <p className="text-gray-600 mb-6">No emission data found. Start by adding your first emission record.</p>
            <a href="/emission-calculator" className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-xl hover:shadow-lg transition">
              Add Emission Data
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        {data.isDemoMode && (
          <div className="mt-10 mb-4 px-4 py-2 bg-amber-100 border border-amber-400 rounded-lg text-amber-800 text-sm font-medium">
            Demo Mode — Backend tidak terhubung. Menampilkan data simulasi.
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${data.isDemoMode ? '' : 'mt-10'}`}>
            GHG Tracker Dashboard
          </h1>
          
          <div className="flex items-center space-x-2 bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg w-fit">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Live</span>
            <span className="text-xs text-gray-500 hidden sm:inline">
              {currentTime.toLocaleTimeString('id-ID')}
            </span>
          </div>
        </div>

        <AlertMissigCategory
          missingCategories={data.missingCategories}
          currentMonthName={data.currentMonthName}
        />
        
        <DashboardCards 
          data={data}
          currentYear={data.years.current}
          previousYear={data.years.previous}
          currentMonth={data.currentMonth}
          months={months}
        />

        <CategoryBreakdown 
          categories={data.categories || {}}
          currentYear={data.years.current}
          previousYear={data.years.previous}
        />

        <EmissionChart 
          plantData={data.plantData}
          currentYear={data.years.current}
          previousYear={data.years.previous}
          currentMonth={data.currentMonth}
        />
      </div>
    </div>
  );
};

export default Dashboard;