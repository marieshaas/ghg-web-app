import React from 'react';

const WwtpManualInput = ({ manualData, onDataChange }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
      <h4 className="text-base sm:text-lg font-bold text-blue-800 mb-4">Manual Input - Domestic WasteWater</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Population
          </label>
          <input
            type="number"
            step="10"
            value={manualData.population}
            onChange={(e) => onDataChange({ ...manualData, population: e.target.value })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="456352"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Protein Consumption per Capita
          </label>
          <input
            type="number"
            step="0.1"
            value={manualData.proteinConsumperCapita}
            onChange={(e) => onDataChange({ ...manualData, proteinConsumperCapita: e.target.value })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="93920"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Sludge Removed
          </label>
          <input
            type="number"
            step="0.01"
            value={manualData.sludgeRemoved}
            onChange={(e) => onDataChange({ ...manualData, sludgeRemoved: e.target.value })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Methane Recovered
          </label>
          <input
            type="number"
            step="0.1"
            value={manualData.methaneRecovered}
            onChange={(e) => onDataChange({ ...manualData, methaneRecovered: e.target.value })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default WwtpManualInput;