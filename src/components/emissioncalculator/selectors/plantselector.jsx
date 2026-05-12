import React from 'react';

const PlantSelector = ({ selectedPlant, plants, onSelect, isOpen, onToggle }) => {
  return (
    <div className="relative">
      <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3"></div>
        Plant Selection
      </label>
      
      <div 
        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-orange-400 hover:shadow-lg transition-all duration-300 group"
        onClick={onToggle}
      >
        <span className={`${selectedPlant ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-orange-700 transition-colors`}>
          {selectedPlant ? plants.find(p => p.value === selectedPlant)?.label : 'Select Plant'}
        </span>
        <svg className={`w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-orange-100 rounded-xl shadow-2xl overflow-hidden">
          {plants.map((plant) => (
            <div
              key={plant.value}
              className="px-6 py-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 cursor-pointer border-b border-orange-50 last:border-b-0 text-gray-800 hover:text-orange-800 transition-all duration-200"
              onClick={() => onSelect(plant.value)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {plant.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantSelector;