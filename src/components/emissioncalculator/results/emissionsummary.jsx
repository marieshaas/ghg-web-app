import React from 'react';
import { formatNumber } from '../../../utils/format/numberformatter';
import { subcategories } from '../../../config/emissionconfig';

const EmissionSummary = ({ 
  results, 
  totalEmission, 
  selectedSubcategory, 
  selectedCategory,
  onExportExcel,
  onExportPDF,
  onSaveToDatabase
}) => {
  
  if (results.length === 0) return null;

  const categoryLabel = subcategories[selectedCategory]?.find(
    sub => sub.value === selectedSubcategory
  )?.label || '';

  const avgEmission = results.length > 0 ? totalEmission / results.length : 0;
  const maxEmission = results.length > 0 ? Math.max(...results.map(r => parseFloat(r.emission))) : 0;
  const minEmission = results.length > 0 ? Math.min(...results.map(r => parseFloat(r.emission))) : 0;

  const isTransportCategory = ['3.1', '3.11', '3.5', '3.2'].includes(selectedSubcategory);
  const decimals = isTransportCategory ? 4 : (selectedSubcategory === '2.1' ? 4 : 5);

  return (
    <>
      {/* Total Emission Summary */}
      <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Total CO₂ Emissions</h3>
              <p className="text-green-100 text-sm">{categoryLabel}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold">
              {formatNumber(totalEmission, decimals, selectedSubcategory === '2.1' ? 4 : 0)}
            </div>
            <div className="text-green-100 text-lg">tCO₂e</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">{results.length}</div>
              <div className="text-green-100 text-xs sm:text-sm">Records</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">
                {formatNumber(avgEmission, 2)}
              </div>
              <div className="text-green-100 text-xs sm:text-sm">Avg. tCO₂e</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">
                {formatNumber(maxEmission, 2)}
              </div>
              <div className="text-green-100 text-xs sm:text-sm">Max tCO₂e</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">
                {formatNumber(minEmission, 2)}
              </div>
              <div className="text-green-100 text-xs sm:text-sm">Min tCO₂e</div>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Database and Export Options */}
      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
        {/* Save to Database Button - Most Prominent */}
        {/* <button 
          onClick={onSaveToDatabase}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-purple-400 font-bold text-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save to Database
        </button> */}

        <button 
          onClick={onExportExcel}
          className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
        
        <button 
          onClick={onExportPDF}
          className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to PDF
        </button>
      </div>
    </>
  );
};

export default EmissionSummary;