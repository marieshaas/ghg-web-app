import React from 'react';

const months = [
  { value: '1', label: 'January', short: 'Jan' },
  { value: '2', label: 'February', short: 'Feb' },
  { value: '3', label: 'March', short: 'Mar' },
  { value: '4', label: 'April', short: 'Apr' },
  { value: '5', label: 'May', short: 'May' },
  { value: '6', label: 'June', short: 'Jun' },
  { value: '7', label: 'July', short: 'Jul' },
  { value: '8', label: 'August', short: 'Aug' },
  { value: '9', label: 'September', short: 'Sep' },
  { value: '10', label: 'October', short: 'Oct' },
  { value: '11', label: 'November', short: 'Nov' },
  { value: '12', label: 'December', short: 'Dec' },
];

const PeriodSelector = ({ 
  selectedPeriod, 
  selectedYear,
  isYearOnly,  
  onPeriodSelect, 
  onYearChange,
  onYearOnlyToggle,  
  isOpen, 
  onToggle 
}) => {
  const getDisplayText = () => {
    if (isYearOnly && selectedYear) {
      return `Full Year ${selectedYear}`;
    }
    if (selectedPeriod && selectedYear) {
      const month = months.find(m => m.value === selectedPeriod);
      return `${month?.label} ${selectedYear}`;
    }
    return 'Select Period';
  };

  return (
    <div className="relative">
      <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
        Period Selection
      </label>
      
      <div 
        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-purple-400 hover:shadow-lg transition-all duration-300 group"
        onClick={onToggle}
      >
        <span className={`${(selectedPeriod || isYearOnly) ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-purple-700 transition-colors`}>
          {getDisplayText()}
        </span>
        <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-purple-100 rounded-xl shadow-2xl p-6">
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onYearChange(selectedYear - 1);
              }}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-lg font-semibold text-gray-800">
              {selectedYear}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onYearChange(selectedYear + 1);
              }}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Toggle: Monthly or Full Year */}
          <div className="mb-4 flex items-center justify-center gap-3 pb-4 border-b border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onYearOnlyToggle(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isYearOnly
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onYearOnlyToggle(true);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isYearOnly
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Full Year
            </button>
          </div>

          {/* Month Grid - Only show if not Year Only */}
          {!isYearOnly && (
            <div className="grid grid-cols-3 gap-3">
              {months.map((month) => (
                <button
                  key={month.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPeriodSelect(month.value);
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === month.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 hover:shadow-md'
                  }`}
                >
                  <div className="text-xs mb-1">{month.short}</div>
                  <div className="text-xs opacity-80">{month.value.padStart(2, '0')}</div>
                </button>
              ))}
            </div>
          )}

          {/* Year Only Message */}
          {isYearOnly && (
            <div className="text-center py-6 text-gray-600">
              <svg className="w-12 h-12 mx-auto mb-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">Full Year Period Selected</p>
              <p className="text-xs mt-1">Period will be: <span className="font-semibold text-purple-600">{selectedYear}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;