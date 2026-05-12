import { useState, useEffect } from 'react';
import { months } from '../../src/config/emissionconfig';
import { parseExcelFile } from '../utils/parsers/parserexcelfile';
import { emissionCalculations, wwtpEmission } from '../utils/calculations';
import { saveToDatabase, checkDuplicate } from '../utils/savedatabase';

export const useEmissionCalculator = () => {
  // State management
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedSubArea, setSelectedSubArea] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPlantDropdown, setShowPlantDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showSubAreaDropdown, setShowSubAreaDropdown] = useState(false);
  const [showPeriodCalendar, setShowPeriodCalendar] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [calculationResults, setCalculationResults] = useState([]);
  const [totalEmission, setTotalEmission] = useState(0);
  const [manualInputMode, setManualInputMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isYearOnly, setIsYearOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [manualData, setManualData] = useState({
    lwbp: '',
    wbp: '',
    emissionFactor: 0.80,
    gwp: 1.0,
    population: '',
    proteinConsumperCapita: '',
    sludgeRemoved: '',
    methaneRecovered: ''
  });

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowPlantDropdown(false);
    setShowCategoryDropdown(false);
    setShowSubcategoryDropdown(false);
    setShowPeriodCalendar(false);
  };

  // Handler functions
  const handlePlantSelect = (plantValue) => {
    setSelectedPlant(plantValue);
    setShowPlantDropdown(false);
  };

  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setSelectedSubcategory('');
    setShowCategoryDropdown(false);
    setCalculationResults([]);
    setTotalEmission(0);
  };

  const handleSubcategorySelect = (subcategoryValue) => {
    setSelectedSubcategory(subcategoryValue);
    setShowSubcategoryDropdown(false);
    setCalculationResults([]);
    setTotalEmission(0);
    setManualInputMode(false);
    setSelectedSubArea('');
  };


  const handlePeriodSelect = (monthValue) => {
    setSelectedPeriod(monthValue);
    setShowPeriodCalendar(false);
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
  };

  const handleSubAreaSelect = (subAreaValue) => {
    setSelectedSubArea(subAreaValue);
    setShowSubAreaDropdown(false);
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);
  };

   const toggleSubAreaDropdown = () => {
    setShowSubAreaDropdown(!showSubAreaDropdown);
    setShowPlantDropdown(false);
    setShowCategoryDropdown(false);
    setShowSubcategoryDropdown(false);
    setShowPeriodCalendar(false);

  }

  const togglePlantDropdown = () => {
    setShowPlantDropdown(!showPlantDropdown);
    setShowCategoryDropdown(false);
    setShowSubcategoryDropdown(false);
    setShowPeriodCalendar(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowPlantDropdown(false);
    setShowSubcategoryDropdown(false);
    setShowPeriodCalendar(false);
  };

  const toggleSubcategoryDropdown = () => {
    setShowSubcategoryDropdown(!showSubcategoryDropdown);
    setShowPlantDropdown(false);
    setShowCategoryDropdown(false);
    setShowPeriodCalendar(false);
  };

  const togglePeriodCalendar = () => {
    setShowPeriodCalendar(!showPeriodCalendar);
    setShowPlantDropdown(false);
    setShowCategoryDropdown(false);
    setShowSubcategoryDropdown(false);
  };

  const toggleManualInputMode = () => {
    setManualInputMode(!manualInputMode);
  };
  
  const handleYearOnlyToggle = (yearOnly) => {
    setIsYearOnly(yearOnly);
    if (yearOnly) {
      setSelectedPeriod('');
    }
  };

  // **CALCULATE ONLY **
  const handleCalculate = async () => {
    console.log('=== CALCULATE STARTED ===');
    
    // Validation
    if (!selectedPlant || !selectedCategory || !selectedSubcategory) {
      alert('Please select plant, category, and subcategory');
      return;
    }

    if (!isYearOnly && !selectedPeriod) {
      alert('Please select a period');
      return;
    }

    try {
      setLoading(true);
      let results = [];

      if (selectedSubcategory === '1.3' && manualInputMode) {
        if (!manualData.population || !manualData.proteinConsumperCapita) {
            alert('Please enter valid Population and Protein Consumption per Capita');
            setLoading(false);
            return;
          }

          const population = parseFloat(manualData.population) || 0;
          const proteinConsumperCapita = parseFloat(manualData.proteinConsumperCapita) || 0;
          const sludgeRemoved = parseFloat(manualData.sludgeRemoved) || 0;
          const methaneRecovered = parseFloat(manualData.methaneRecovered) || 0;
          
          const ef = wwtpEmission;
          const emissions = emissionCalculations.calculationWwtp(
            population, 
            proteinConsumperCapita, 
            ef, 
            sludgeRemoved, 
            methaneRecovered
          );

          const monthObj = months.find(m => m.value === selectedPeriod);
          const period = isYearOnly 
            ? selectedYear.toString() 
            : `${monthObj?.label} ${selectedYear}`;

          results = [{
            period,
            population,
            proteinConsumperCapita,
            organicDegradMaterial: emissions.organicDegradMaterial,
            sludgeRemoved,
            methaneRecovered,
            ch4_ef: ef.ch4,
            ch4_gwp: ef.ch4_gwp,
            ch4: emissions.ch4,
            n2o_ef: ef.n2o,
            n2o_gwp: ef.n2o_gwp,
            n2o: emissions.n2o,
            emission: emissions.total.toFixed(12),
            plant: selectedPlant,
            subArea: selectedSubArea || 'wwtp'
          }];

          console.log('Manual WWTP input result:', results[0]);
        }

      else if (selectedSubcategory === '2.1' && manualInputMode) {
        if (!manualData.lwbp || !manualData.wbp) {
          alert('Please enter valid LWBP and WBP data');
          setLoading(false);
          return;
        }

        const lwbp = parseFloat(manualData.lwbp) || 0;
        const wbp = parseFloat(manualData.wbp) || 0;
        const totalKWh = lwbp + wbp;
        const totalMWh = totalKWh / 1000;
        const emissionFactor = parseFloat(manualData.emissionFactor) || 0.80;
        const gwp = parseFloat(manualData.gwp) || 1.0;
        const emission = totalMWh * emissionFactor * gwp;

        const monthObj = months.find(m => m.value === selectedPeriod);
        const period = isYearOnly 
          ? selectedYear.toString() 
          : `${monthObj?.label} ${selectedYear}`;

        results = [{
          period,
          lwbp,
          wbp,
          totalKWh,
          totalMWh,
          emissionFactor,
          gwp,
          emission: emission.toFixed(4),
          plant: selectedPlant,
          subArea: selectedSubArea || null
        }];

        console.log('Manual input result:', results[0]);
      }
   
      else if (uploadedFile) {
        console.log('Parsing file:', uploadedFile.name);
        results = await parseExcelFile(
                  uploadedFile, 
                  selectedSubcategory, 
                  selectedPlant,
                  selectedYear,
                  isYearOnly,
                  selectedSubArea,
                  selectedPeriod);
        console.log('Parse results:', results);
      } else {
        alert('Please upload a file or enter manual data');
        setLoading(false);
        return;
      }

      // Set results to state
      setCalculationResults(results);
      
      // Calculate total
      const total = results.reduce((sum, item) => sum + parseFloat(item.emission || 0), 0);
      setTotalEmission(total);
      
      console.log('Total emission:', total);
      console.log('=== CALCULATE COMPLETED ===');
      
      // Auto-save setelah calculate
      const metadata = {
        selectedPlant,
        selectedSubcategory,
        selectedPeriod,
        selectedYear,
        selectedSubArea,
        selectedMonth: isYearOnly ? 0 : selectedPeriod
      };

      // Cek duplikat dulu
      const { isDuplicate } = await checkDuplicate(metadata);

      if (isDuplicate) {
        const confirmReplace = window.confirm(
          `⚠️ Data dengan periode, plant, dan kategori yang sama sudah ada di database.\n\nApakah kamu ingin mengganti data lama dengan data baru ini?\n\n- OK = Ganti data lama\n- Cancel = Batal simpan`
        );
        if (!confirmReplace) {
          alert(`ℹ️ Data tidak disimpan. Hasil kalkulasi tetap ditampilkan di bawah.`);
          return;
        }
      }

      // Simpan ke database
      const saveResult = await saveToDatabase(results, metadata);

      if (saveResult.success) {
        alert(`✅ Kalkulasi selesai & tersimpan!\n${results.length} record(s) berhasil disimpan.\nTotal: ${total.toFixed(4)} tCO2e`);
      } else {
        alert(`✅ Kalkulasi selesai!\nTotal: ${total.toFixed(4)} tCO2e\n\n⚠️ Gagal auto-save: ${saveResult.error}`);
      }

    } catch (error) {
      console.error('Calculation error:', error);
      alert(`❌ Calculation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    selectedPlant,
    selectedCategory,
    selectedSubcategory,
    selectedPeriod,
    selectedYear,
    selectedSubArea,
    showPlantDropdown,
    showCategoryDropdown,
    showSubcategoryDropdown,
    showPeriodCalendar,
    showSubAreaDropdown,
    uploadedFile,
    calculationResults,
    totalEmission,
    manualInputMode,
    isMobile,
    manualData,
    isYearOnly,
    loading,

    // Handlers
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
    handleYearOnlyToggle,
    setManualData,
    closeAllDropdowns,
  };
};