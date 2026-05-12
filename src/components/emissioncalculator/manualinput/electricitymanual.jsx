import React from 'react';

const ElectricityManualInput = ({ manualData, onDataChange }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
      <h4 className="text-base sm:text-lg font-bold text-blue-800 mb-4">Manual Input - Electricity Usage Data</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            LWBP (KWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={manualData.lwbp}
            onChange={(e) => onDataChange({ ...manualData, lwbp: e.target.value })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="456352"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            WBP (KWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={manualData.wbp}
            onChange={(e) => onDataChange({ ...manualData, wbp: e.target.value })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="93920"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Emission Factor (tCO2/MWh)
          </label>
          <input
            type="number"
            step="0.001"
            value={manualData.emissionFactor}
            onChange={(e) => onDataChange({ ...manualData, emissionFactor: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            GWP
          </label>
          <input
            type="number"
            step="0.1"
            value={manualData.gwp}
            onChange={(e) => onDataChange({ ...manualData, gwp: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {manualData.lwbp && manualData.wbp && (
        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Total KWh:</strong> {(parseFloat(manualData.lwbp || 0) + parseFloat(manualData.wbp || 0)).toLocaleString('id-ID')} KWh
            <br />
            <strong>Total MWh:</strong> {((parseFloat(manualData.lwbp || 0) + parseFloat(manualData.wbp || 0)) / 1000).toLocaleString('id-ID', { minimumFractionDigits: 3 })} MWh
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricityManualInput;