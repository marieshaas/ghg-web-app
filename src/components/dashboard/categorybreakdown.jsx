import React from 'react';

const CategoryBreakdown = ({ categories, currentYear, previousYear }) => {
  const colors = [
    { 
      bg: 'from-red-50 to-red-100', 
      border: 'border-red-200', 
      text: 'text-red-700', 
      icon: 'from-red-500 to-red-600', 
      barCurrent: 'bg-gradient-to-r from-red-500 to-red-600',
      barPrevious: 'bg-gradient-to-r from-red-200 to-red-300'
    },
    { 
      bg: 'from-blue-50 to-blue-100', 
      border: 'border-blue-200', 
      text: 'text-blue-700', 
      icon: 'from-blue-500 to-blue-600', 
      barCurrent: 'bg-gradient-to-r from-blue-500 to-blue-600',
      barPrevious: 'bg-gradient-to-r from-blue-200 to-blue-300'
    },
    { 
      bg: 'from-green-50 to-green-100', 
      border: 'border-green-200', 
      text: 'text-green-700', 
      icon: 'from-green-500 to-green-600', 
      barCurrent: 'bg-gradient-to-r from-green-500 to-green-600',
      barPrevious: 'bg-gradient-to-r from-green-200 to-green-300'
    },
    { 
      bg: 'from-purple-50 to-purple-100', 
      border: 'border-purple-200', 
      text: 'text-purple-700', 
      icon: 'from-purple-500 to-purple-600', 
      barCurrent: 'bg-gradient-to-r from-purple-500 to-purple-600',
      barPrevious: 'bg-gradient-to-r from-purple-200 to-purple-300'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 sm:p-6 lg:p-8 shadow-lg border border-white backdrop-blur-sm hover:shadow-xl transition-all duration-300 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 lg:mb-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">GHG Categories Breakdown</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {Object.entries(categories).map(([key, category], index) => (
          <CategoryCard 
            key={key}
            category={category}
            color={colors[index]}
            currentYear={currentYear}
            previousYear={previousYear}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryCard = ({ category, color, currentYear, previousYear }) => {
  const maxValue = Math.max(category.current, category.previous, 1);
  const currentPercent = (category.current / maxValue) * 100;
  const previousPercent = (category.previous / maxValue) * 100;
  
  return (
    <div className={`bg-gradient-to-br ${color.bg} rounded-xl p-4 sm:p-5 border-2 ${color.border} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${color.icon} rounded-lg mr-3 flex-shrink-0 shadow-md`}>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className={`text-sm sm:text-base font-bold ${color.text}`}>{category.code}</h4>
            <p className="text-xs text-gray-600 leading-tight">{category.name}</p>
          </div>
        </div>
        
        {/* YoY Badge */}
        {category.previous > 0 && (
          <div className={`px-2 py-1 rounded-lg ${category.yoyChange >= 0 ? 'bg-red-100' : 'bg-green-100'}`}>
            <span className={`text-xs font-bold ${category.yoyChange >= 0 ? 'text-red-700' : 'text-green-700'}`}>
              {category.yoyChange >= 0 ? '▲' : '▼'} {Math.abs(category.yoyChange).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Current Year Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${color.text} bg-white px-2 py-0.5 rounded`}>{currentYear}</span>
            <span className="text-xs text-gray-500">Current</span>
          </div>
          <span className={`text-lg sm:text-xl font-bold ${color.text}`}>
            {category.current.toLocaleString('id-ID', { maximumFractionDigits: 10 })}
          </span>
        </div>
        <div className="relative w-full bg-white rounded-full h-6 sm:h-7 overflow-hidden shadow-inner">
          <div 
            className={`${color.barCurrent} h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`} 
            style={{ width: `${currentPercent}%` }}
          >
            {currentPercent > 20 && (
              <span className="text-xs font-bold text-white">tCO2e</span>
            )}
          </div>
        </div>
      </div>

      {/* Previous Year Bar */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded">{previousYear}</span>
            <span className="text-xs text-gray-400">Previous</span>
          </div>
          <span className="text-base sm:text-lg font-semibold text-gray-600">
            {category.previous.toLocaleString('id-ID', { maximumFractionDigits: 10 })}
          </span>
        </div>
        <div className="relative w-full bg-white rounded-full h-4 sm:h-5 overflow-hidden shadow-inner">
          <div 
            className={`${color.barPrevious} h-full rounded-full transition-all duration-1000 ease-out`} 
            style={{ width: `${previousPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CategoryBreakdown);