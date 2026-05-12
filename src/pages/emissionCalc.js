import React, { useState } from 'react';
import { useEmissionCalculator } from '../hooks/useemissionCalculator';
import { plants, categories, subcategories } from '../config/emissionconfig';
import PlantSelector from '../components/emissioncalculator/selectors/plantselector';
import CategorySelector from '../components/emissioncalculator/selectors/categoryselector';
import SubcategorySelector from '../components/emissioncalculator/selectors/subcategoryselector';
import PeriodSelector from '../components/emissioncalculator/selectors/periodselector';
import FileUploadZone from '../components/emissioncalculator/fileupload/fileupload';
import ElectricityManualInput from '../components/emissioncalculator/manualinput/electricitymanual';
import WwtpManualInput from '../components/emissioncalculator/manualinput/wwtpmanualinput';
import MobileResultCards from '../components/emissioncalculator/results/mobilecard';
import DesktopResultTable from '../components/emissioncalculator/results/desktoptable';
import EmissionSummary from '../components/emissioncalculator/results/emissionsummary';
import { exportToExcel, exportToPDF } from '../utils/exportData';
import SubAreaSelector from '../components/emissioncalculator/selectors/subareaselector';
import { subAreas } from '../config/emissionconfig';

const EmissionCalculator = () => {
  const {
    selectedPlant,
    selectedCategory,
    selectedSubcategory,
    selectedPeriod,
    selectedYear,
    selectedSubArea,
    showSubAreaDropdown,
    showPlantDropdown,
    showCategoryDropdown,
    showSubcategoryDropdown,
    showPeriodCalendar,
    uploadedFile,
    calculationResults,
    totalEmission,
    manualInputMode,
    isMobile,
    manualData,
    handlePlantSelect,
    handleCategorySelect,
    handleSubcategorySelect,
    handlePeriodSelect,
    handleYearChange,
    handleSubAreaSelect,
    handleFileUpload,
    handleCalculate,
    togglePlantDropdown,
    toggleCategoryDropdown,
    toggleSubcategoryDropdown,
    togglePeriodCalendar,
    toggleSubAreaDropdown,
    toggleManualInputMode,
    setManualData,
    isYearOnly,
    handleYearOnlyToggle,
  } = useEmissionCalculator();

  const [isSaving, setIsSaving] = useState(false);

  const handleExportExcel = () => {
    const result = exportToExcel(
      calculationResults,
      `emission_${selectedSubcategory}`,
      selectedSubcategory
    );
    
    if (result.success) {
      alert('Export to Excel successful!');
    } else {
      alert(`Export failed: ${result.error}`);
    }
  };

  const handleExportPDF = async () => {
    const categoryLabel = subcategories[selectedCategory]?.find(
      sub => sub.value === selectedSubcategory
    )?.label || '';
    
    const result = await exportToPDF(
      calculationResults,
      totalEmission,
      selectedSubcategory,
      categoryLabel
    );
    
    if (result.success) {
      alert('Export to PDF successful!');
    } else {
      alert(`Export failed: ${result.error}`);
    }
  };

  // const handleSaveToDatabase = async () => {
  //   if (calculationResults.length === 0) {
  //     alert('No data to save. Please calculate emissions first.');
  //     return;
  //   }

  //   const confirmSave = window.confirm(
  //     `Are you sure you want to save ${calculationResults.length} records to the database?`
  //   );

  //   if (!confirmSave) return;

  //   setIsSaving(true);

  //   try {
  //     const metadata = {
  //       selectedPlant,
  //       selectedSubcategory,
  //       selectedPeriod,
  //       selectedYear,
  //       selectedMonth: isYearOnly ? 0 : selectedPeriod
  //     };

  //     const result = await saveToDatabase(calculationResults, metadata);

  //     if (result.success) {
  //       alert(`✅ Successfully saved ${calculationResults.length} records to database!`);
  //     } else {
  //       alert(`❌ Failed to save: ${result.error}`);
  //     }
  //   } catch (error) {
  //     alert(`❌ Error: ${error.message}`);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const isCategory13 = selectedSubcategory === '1.3';
  const isCategory21 = selectedSubcategory === '2.1';
  const manualInput = selectedSubcategory === '1.3' || selectedSubcategory === '2.1';
  const needsSubArea = (selectedSubcategory === '1.1' && selectedPlant) || selectedSubcategory === '1.2' || selectedSubcategory === '2.1';
  const isCalculateDisabled = !selectedPlant || !selectedCategory || !selectedSubcategory;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-10">
          Emission Calculator
        </h1>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 sm:p-8">
          <div className="space-y-8">
            
            <PlantSelector
              selectedPlant={selectedPlant}
              plants={plants}
              onSelect={handlePlantSelect}
              isOpen={showPlantDropdown}
              onToggle={togglePlantDropdown}
            />

            <CategorySelector
              selectedCategory={selectedCategory}
              categories={categories}
              onSelect={handleCategorySelect}
              isOpen={showCategoryDropdown}
              onToggle={toggleCategoryDropdown}
            />

            <SubcategorySelector
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              subcategories={subcategories}
              onSelect={handleSubcategorySelect}
              isOpen={showSubcategoryDropdown}
              onToggle={toggleSubcategoryDropdown}
            />
            
            {needsSubArea && (
            <SubAreaSelector
              selectedSubArea={selectedSubArea}
              subAreas={
                selectedSubcategory === '1.1' 
                  ? subAreas['1.1'][selectedPlant] || []
                  : subAreas[selectedSubcategory] || []
              }
              onSelect={handleSubAreaSelect}
              isOpen={showSubAreaDropdown}
              onToggle={toggleSubAreaDropdown}
            />
            )}
            
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              selectedYear={selectedYear}
              isYearOnly={isYearOnly}
              onPeriodSelect={handlePeriodSelect}
              onYearChange={handleYearChange}
              onYearOnlyToggle={handleYearOnlyToggle}
              isOpen={showPeriodCalendar}
              onToggle={togglePeriodCalendar}
            />

            {manualInput && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800">Manual Input Method</h4>
                    <p className="text-sm text-blue-600">Choose between Excel upload or manual input</p>
                  </div>
                  <button
                    onClick={toggleManualInputMode}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      manualInputMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-blue-500 border border-blue-300'
                    }`}
                  >
                    {manualInputMode ? 'Manual Input' : 'Excel Upload'}
                  </button>
                </div>
              </div>
            )}

            {isCategory21 && manualInputMode && (
              <ElectricityManualInput
                manualData={manualData}
                onDataChange={setManualData}
              />
            )}

            {isCategory13 && manualInputMode && (
              <WwtpManualInput
                manualData={manualData}
                onDataChange={setManualData}
              />
            )}

            <FileUploadZone
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
              isCategory21={isCategory21}
              isCategory13={isCategory13}
              manualInputMode={manualInputMode}
            />

            <div className="flex justify-center pt-6">
              <button
                onClick={handleCalculate}
                disabled={isCalculateDisabled}
                className={`w-full sm:w-auto px-12 sm:px-16 py-4 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 focus:ring-4 ${
                  isCalculateDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:scale-105 focus:ring-green-200'
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calculate Emissions
                </span>
              </button>
            </div>

            <div className="pt-8">
              <h2 className="flex items-center text-xl font-bold text-gray-900 mb-6">
                <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Result Calculation
                {calculationResults.length > 0 && (
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {calculationResults.length} records
                  </span>
                )}
              </h2>

              {isMobile ? (
                <MobileResultCards 
                  results={calculationResults} 
                  subcategory={selectedSubcategory} 
                />
              ) : (
                <DesktopResultTable 
                  results={calculationResults} 
                  subcategory={selectedSubcategory} 
                />
              )}

              <EmissionSummary
                results={calculationResults}
                totalEmission={totalEmission}
                selectedSubcategory={selectedSubcategory}
                selectedCategory={selectedCategory}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
              />
            </div>
          </div>
        </div>

        {/* Loading Overlay when Saving */}
        {isSaving && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Saving to Database...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmissionCalculator;