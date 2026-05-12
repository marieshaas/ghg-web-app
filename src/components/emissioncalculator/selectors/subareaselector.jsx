import React from 'react';

const SubAreaSelector = ({
    selectedSubArea,
    subAreas,
    onSelect,
    isOpen,
    onToggle
 }) => {
    return (
        <div className="relative">
      <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
        Sub Area 
      </label>
      
      <div 
        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-purple-400 hover:shadow-lg transition-all duration-300 group"
        onClick={onToggle}
      >
        <span className={`${selectedSubArea ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-purple-700 transition-colors`}>
          {selectedSubArea 
            ? subAreas.find(sa => sa.value === selectedSubArea)?.label 
            : 'Select Sub Area (Optional)'}
        </span>
        <svg className={`w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-purple-100 rounded-xl shadow-2xl overflow-hidden">
          <div
            className="px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 cursor-pointer border-b border-purple-50 text-gray-600 hover:text-gray-800 transition-all duration-200"
            onClick={() => onSelect('')}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-xs">
                -
              </div>
              No Sub Area
            </div>
          </div>
          {subAreas.map((subArea) => (
            <div
              key={subArea.value}
              className="px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer border-b border-purple-50 last:border-b-0 text-gray-800 hover:text-purple-800 transition-all duration-200"
              onClick={() => onSelect(subArea.value)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-xs">
                  {subArea.label.charAt(0)}
                </div>
                {subArea.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    );
 };

 export default SubAreaSelector;