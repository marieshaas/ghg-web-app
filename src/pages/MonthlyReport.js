import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useMonthlyReport from '../hooks/usemonthlyreport';
import { exportMonthlyReportToExcel, exportMonthlyReportToPDF } from '../utils/monthlyReportExports';

const MonthlyReport = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlant, setSelectedPlant] = useState(searchParams.get('plant') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showPlantDropdown, setShowPlantDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Fetch report data
  const { data, summary, availableYears, loading, isDemoMode } = useMonthlyReport({
    plant_id: selectedPlant,
    category_id: selectedCategory,
    month: selectedMonth,
    year: selectedYear
  });

  const plants = [
    { value: '', label: 'All Plants' },
    { value: '1', label: 'Plant A' },
    { value: '2', label: 'Plant B' },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: '1', label: '1 - Direct Emissions' },
    { value: '2', label: '2 - Indirect Emissions' },
    { value: '3', label: '3 - Other Indirect Emissions (Transportation)' },
    { value: '4', label: '4 - Other Indirect Emissions (Product/Material)' },
  ];

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = [
    { value: '', label: 'All Years' },
    ...availableYears.map(year => ({ value: year.toString(), label: year.toString() }))
  ];

  const handleDropdownToggle = (dropdown) => {
    setShowPlantDropdown(dropdown === 'plant' ? !showPlantDropdown : false);
    setShowCategoryDropdown(dropdown === 'category' ? !showCategoryDropdown : false);
    setShowMonthDropdown(dropdown === 'month' ? !showMonthDropdown : false);
    setShowYearDropdown(dropdown === 'year' ? !showYearDropdown : false);
  };

  const handleSelect = (type, value) => {
    if (type === 'plant') {
      setSelectedPlant(value);
      setShowPlantDropdown(false);
    } else if (type === 'category') {
      setSelectedCategory(value);
      setShowCategoryDropdown(false);
    } else if (type === 'month') {
      setSelectedMonth(value);
      setShowMonthDropdown(false);
    } else if (type === 'year') {
      setSelectedYear(value);
      setShowYearDropdown(false);
    }
  };

  const handleExportPDF = async () => {
  const filters = {
    plant: selectedPlant ? plants.find(p => p.value === selectedPlant)?.label : 'All',
    category: selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : 'All',
    month: selectedMonth ? months.find(m => m.value === selectedMonth)?.label : 'All',
    year: selectedYear || 'All'
  };
  
  const result = await exportMonthlyReportToPDF(data, summary, filters);
  if (!result.success) {
    alert('Export failed: ' + result.error);
  }
};

const handleExportExcel = () => {
  const filters = {
    plant: selectedPlant ? plants.find(p => p.value === selectedPlant)?.label : 'All',
    category: selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : 'All', 
    month: selectedMonth ? months.find(m => m.value === selectedMonth)?.label : 'All',
    year: selectedYear || 'All'
  };
  
  const result = exportMonthlyReportToExcel(data, summary, filters);
  if (!result.success) {
    alert('Export failed: ' + result.error);
  }
};

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        {isDemoMode && (
          <div className="mt-10 mb-4 px-4 py-2 bg-amber-100 border border-amber-400 rounded-lg text-amber-800 text-sm font-medium">
            Demo Mode — Backend tidak terhubung. Menampilkan data simulasi.
          </div>
        )}
        <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ml-1 ${isDemoMode ? '' : 'mt-10'}`}>
          Monthly Report
        </h1>

        {/* Filter Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 sm:p-8 mb-8 relative" style={{zIndex:25}}>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </div>
            Report Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plant Filter */}
            <div className="relative">
              <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3"></div>
                Plant
              </label>
              <div 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-orange-400 hover:shadow-lg transition-all duration-300 group"
                onClick={() => handleDropdownToggle('plant')}
              >
                <span className={`${selectedPlant ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-orange-700 transition-colors`}>
                  {selectedPlant ? plants.find(p => p.value === selectedPlant)?.label : 'All Plants'}
                </span>
                <svg className={`w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-all duration-300 ${showPlantDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showPlantDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-orange-100 rounded-xl shadow-2xl overflow-hidden" style={{zIndex: 35, top: '100%'}}>
                  {plants.map((plant) => (
                    <div
                      key={plant.value}
                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 cursor-pointer border-b border-orange-50 last:border-b-0 text-gray-800 hover:text-orange-800 transition-all duration-200"
                      onClick={() => handleSelect('plant', plant.value)}
                    >
                      {plant.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></div>
                Category
              </label>
              <div 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
                onClick={() => handleDropdownToggle('category')}
              >
                <span className={`${selectedCategory ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-green-700 transition-colors`}>
                  {selectedCategory ? categories.find(cat => cat.value === selectedCategory)?.label : 'All Categories'}
                </span>
                <svg className={`w-5 h-5 text-gray-600 group-hover:text-green-600 transition-all duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showCategoryDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-green-100 rounded-xl shadow-2xl overflow-hidden" style={{zIndex: 35, top: '100%'}}>
                  {categories.map((category) => (
                    <div
                      key={category.value}
                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer border-b border-green-50 last:border-b-0 text-gray-800 hover:text-green-800 transition-all duration-200"
                      onClick={() => handleSelect('category', category.value)}
                    >
                      {category.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Month Filter */}
            <div className="relative">
              <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3"></div>
                Month
              </label>
              <div 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
                onClick={() => handleDropdownToggle('month')}
              >
                <span className={`${selectedMonth ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-blue-700 transition-colors`}>
                  {selectedMonth ? months.find(month => month.value === selectedMonth)?.label : 'All Months'}
                </span>
                <svg className={`w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-all duration-300 ${showMonthDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showMonthDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-blue-100 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {months.map((month) => (
                    <div
                      key={month.value}
                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-blue-50 last:border-b-0 text-gray-800 hover:text-blue-800 transition-all duration-200"
                      onClick={() => handleSelect('month', month.value)}
                    >
                      {month.label}
                    </div>
                  ))}    
                </div>
              )}
            </div>

            {/* Year Filter */}
            <div className="relative">
              <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                Year
              </label>
              <div 
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-pointer flex items-center justify-between hover:border-purple-400 hover:shadow-lg transition-all duration-300 group"
                onClick={() => handleDropdownToggle('year')}
              >
                <span className={`${selectedYear ? 'text-gray-900 font-medium' : 'text-gray-600'} group-hover:text-purple-700 transition-colors`}>
                  {selectedYear ? years.find(year => year.value === selectedYear)?.label : 'All Years'}
                </span>
                <svg className={`w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-all duration-300 ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showYearDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-purple-100 rounded-xl shadow-2xl overflow-hidden">
                  {years.map((year) => (
                    <div
                      key={year.value}
                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer border-b border-purple-50 last:border-b-0 text-gray-800 hover:text-purple-800 transition-all duration-200"
                      onClick={() => handleSelect('year', year.value)}
                    >
                      {year.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report data...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-12 text-center border border-gray-200">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Data Found</h3>
            <p className="text-gray-500">Select filters above to generate a report</p>
          </div>
        )}

        {/* Report Table */}
        {!loading && data.length > 0 && (
          <>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm overflow-hidden relative" style={{zIndex: 10}}>
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center flex-wrap">
                  <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  Emissions Report Data
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {data.length} records
                  </span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Plant</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Subcategory</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Sub Area</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Period</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Year</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Month</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-r border-gray-200">Emission</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-25 hover:to-indigo-25 transition-all duration-200">
                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-100 font-medium">{row.plant_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{row.category_code} - {row.category_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{row.subcategory_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-100 capitalize">
                          {row.sub_area || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{row.period || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{row.year}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-100">{row.month}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-100 text-right">
                          {row.total_emission.toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {row.record_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Emissions:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-2xl font-bold text-green-700">
                        {summary.totalEmissions.toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                      </span>
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">tCO2e</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Records:</span>
                    <div className="text-xl font-bold text-gray-800 mt-1">{summary.totalRecords}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Plants:</span>
                    <div className="text-xl font-bold text-gray-800 mt-1">{summary.plantCount}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Categories:</span>
                    <div className="text-xl font-bold text-gray-800 mt-1">{summary.categoryCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={handleExportPDF}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-xl hover:from-gray-600 hover:to-gray-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
              
              <button
                onClick={handleExportExcel}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;