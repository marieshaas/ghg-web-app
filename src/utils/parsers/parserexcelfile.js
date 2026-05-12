/* eslint-disable no-unused-vars */
import * as XLSX from 'xlsx';
import { emissionCalculations, vehicleEmissionFactors,tungku, forklift, mobileCombustionFuel, wwtpEmission, refrigerantEmission, boilerGenset, purchasedGoodsEmission } from '../calculations';
import { months, subAreas } from '../../config/emissionconfig';
import { parseIndonesianNumber } from '../format/numberformatter';

const determinePeriod = (excelPeriod, selectedYear, isYearOnly, selectedPeriod) => {
  if (excelPeriod && excelPeriod !== null && excelPeriod !== undefined && excelPeriod !== '') {
    return excelPeriod.toString().trim();
  }

  if (isYearOnly) {
    return selectedYear.toString();
  } else {
    const monthObj = months.find(m => m.value === selectedPeriod);
    return `${monthObj?.label || 'Unknown'} ${selectedYear}`;
  }
};

const findHeaderRow = (jsonData) => {
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => 
      cell && (
        cell.toString().toLowerCase().includes('period') ||
        cell.toString().toLowerCase().includes('bulan') || 
        cell.toString().toLowerCase().includes('lokasi') || 
        cell.toString().toLowerCase().includes('lwbp') ||
        cell.toString().toLowerCase().includes('wbp') ||
        cell.toString().toLowerCase().includes('pemakaian') ||
        cell.toString().toLowerCase().includes('no')
      )
    )) {
      return i;
    }
  }
  return -1;
};

const filterDataRows = (dataRows, subcategory) => {
  if (subcategory !== '2.1') return dataRows;
  
  return dataRows.filter(row => {
    const hasHeaderText = row.some(cell => {
      if (!cell) return false;
      const cellStr = cell.toString().toLowerCase();
      return cellStr.includes('lwbp') || 
             cellStr.includes('wbp') || 
             cellStr.includes('kwh)') ||
             cellStr === 'total (kwh)';
    });
    return !hasHeaderText;
  });
};



const detectPlantFromSheetName = (sheetName) => {
  const name = sheetName.toLowerCase().trim();
  console.log('Available sheets:', sheetName);

  // Cek subArea dulu (lebih spesifik) sebelum cek Plant A/B
  if (name.includes('mini boiler') || name.includes('mini_boiler')) {
    return { subArea: 'mini_boiler' };
  } else if (name.includes('genset') || name.includes('generator')) {
    return { subArea: 'genset' };
  } else if (name.includes('incinerator')) {
    return { subArea: 'incinerator', id: 'b' };
  } else if (name === 'boiler' || name.includes('tungku bakar boiler')) {
    return { subArea: 'tungku_boiler', id: 'b' };
  }

  // Cek Plant B/A — harus exact match atau diawali huruf itu, bukan sekadar contains
  if (name === 'b' || name === 'plant b' || name.includes('3576')) {
    return { id: 'B', name: 'Plant B' };
  } else if (name === 'a' || name === 'plant a' || name.includes('3575')) {
    return { id: 'A', name: 'Plant A' };
  }

  return null;
};


export const parseTransportData = (dataRows, subcategory, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  console.log(`=== PARSING TRANSPORT DATA ===`);
  console.log(`Data rows received: ${dataRows.length}`);
  
  const processedData = dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const supplier = row[2] || '-';
    const vehicleType = (row[3] || '').toString().trim();  
    const size = (row[5] || '').toString().trim();         
    const fuel = (row[7] || '').toString().trim(); 
    const distance = parseFloat(row[8]) || 0;
    
    const quantity = subcategory === '3.1' ? (parseFloat(row[9]) || 1) : 1;
    const totalDistance = distance * quantity;
    const efKey = `${vehicleType}-${size}-${fuel}`;
    const ef = vehicleEmissionFactors[efKey];

    if (!ef) {
      console.error(`Row ${index + 1}: Emission factor tidak ditemukan untuk "${efKey}"`);
      return null;
    }
    
    const emissions = emissionCalculations.calculateUpstreamTransport(totalDistance, ef);
    
     if (index < 5) {
      console.log(`Row ${index + 1}: distance=${distance}, quantity=${quantity}, totalDistance=${totalDistance}, emission=${emissions.total}`);
    }

    return {
      period,
      supplier,
      vehicleType,
      size,
      fuel,
      distance: distance,
      quantity: subcategory === '3.1' ? quantity : undefined,
      totalDistance: subcategory === '3.1' ? totalDistance : undefined,
      co2_ef: ef.co2,
      co2_gwp: ef.co2_gwp,
      co2: emissions.co2,
      ch4_ef: ef.ch4,
      ch4_gwp: ef.ch4_gwp,
      ch4: emissions.ch4,
      n2o_ef: ef.n2o,
      n2o_gwp: ef.n2o_gwp,
      n2o: emissions.n2o,
      emission: emissions.total,
      plant: selectedPlant
    };
  }).filter(item => item !== null);
  
  console.log(`Results after filtering: ${processedData.length} rows`);
  const totalEmission = processedData.reduce((sum, item) => sum + parseFloat(item.emission), 0);
  console.log(`Total emission calculated: ${totalEmission}`);
  
  return processedData;
};

export const parseDownstream = (dataRows, subcategory, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const route = row[1] || '-';
    const vehicleType = (row[2] || '').toString().trim();  
    const size = (row[4] || '').toString().trim();         
    const fuel = (row[6] || '').toString().trim(); 
    const quantity = row[7] || '-' ;
    const distance = parseFloat(row[8]) || 0;
    const totalDistance = distance * quantity;
    const efKey = `${vehicleType}-${size}-${fuel}`;
    const ef = vehicleEmissionFactors[efKey];

    if (!ef) {
      console.error(`Row ${index + 1}: Emission factor tidak ditemukan untuk "${efKey}"`);
      return null;
    }
    
    const emissions = emissionCalculations.calculateUpstreamTransport(totalDistance, ef);

    return {
      period,
      route,
      vehicleType,
      size,
      fuel,
      quantity,
      distance, 
      co2_ef: emissions.co2,
      co2_gwp: ef.co2_gwp,
      co2: emissions.co2,
      ch4_ef: emissions.ch4,
      ch4_gwp: ef.ch4_gwp,
      ch4: emissions.ch4,
      n2o_ef: emissions.n2o,
      n2o_gwp: ef.n2o_gwp,
      n2o: emissions.n2o,
      emission: emissions.total,
      plant: selectedPlant
    };
  }).filter(item => item !== null);
};

export const parseTungku = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows
    .filter(row => {
      const valid = row[0] && !isNaN(parseFloat(row[1])) && !isNaN(parseFloat(row[3]));
      if (!valid) console.log('Filtered out row:', row);
      return valid;
    })
    .map((row, index) => {
      const monthName = row[0];
      const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);;
      const hariKerja = parseFloat(row[1]) || 0;
      const factory = row[2] || 'Unknown';
      const beratDebuperHari = parseFloat(row[3]) || 0;
      const ef = tungku;

      console.log(`Row ${index}: ${monthName}, hariKerja=${hariKerja}, factory=${factory}, debu=${beratDebuperHari}`);

      const emissions = emissionCalculations.calculateTungku(beratDebuperHari, hariKerja, ef);

      return {
        period,
        hariKerja,
        factory,
        beratDebuperHari,
        subArea: 'tungku',
        co2_ef: ef.co2,
        co2_gwp: ef.co2_gwp,
        co2: emissions.co2,
        ch4_ef: ef.ch4,
        ch4_gwp: ef.ch4_gwp,
        ch4: emissions.ch4,
        n2o_ef: ef.n2o,
        n2o_gwp: ef.n2o_gwp,
        n2o: emissions.n2o,
        emission: emissions.total,
        plant: selectedPlant
      };
    });
};

export const parseTungkuMajalengka = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod, subAreaType) => {
  const isPlantB = selectedPlant === 'b' || selectedPlant === 'B' || selectedPlant === '2' || selectedPlant === 2;
  if (!isPlantB) {
    return [];
  }
  
  const results = [];
  
  dataRows.forEach((row) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const hariKerja = parseFloat(row[1]) || 0;
    const beratDebuperHari = parseFloat(row[3]) || 0;
    const ef = tungku;

    if (beratDebuperHari > 0) {
      const emissions = emissionCalculations.calculateTungku(beratDebuperHari, hariKerja, ef);
      
      results.push({
        period,
        hariKerja,
        factory: subAreaType === 'incinerator' ? 'Incinerator Maja' : 'Boiler Maja',
        beratDebuperHari,
        beratDebuperBulan: emissions.debuPerBulanKg,
        subArea: subAreaType,
        co2_ef: ef.co2,
        co2_gwp: ef.co2_gwp,
        co2: emissions.co2,
        ch4_ef: ef.ch4,
        ch4_gwp: ef.ch4_gwp,
        ch4: emissions.ch4,
        n2o_ef: ef.n2o,
        n2o_gwp: ef.n2o_gwp,
        n2o: emissions.n2o,
        emission: emissions.total,
        plant: selectedPlant
      });
    }
  });

  return results;
};

export const parseForklift = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => { 
 return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const consume_bbm = parseFloat(row[1]) || 0;
    
    const ef = forklift;
    
    const emissions = emissionCalculations.calculateForklift(consume_bbm, ef);

    return {
      period,
      subArea: 'forklift',
      consume_bbm,
      co2_ef_fossil: ef.co2_fossil,
      co2_ef_bio: ef.co2_bio,
      co2_gwp: ef.co2_gwp,
      co2: emissions.co2_total,
      ch4_ef_fossil: ef.ch4_fossil,
      ch4_gwp: ef.ch4_gwp,
      ch4: emissions.ch4_fossil,
      n2o_ef_fossil: ef.n2o_fossil,
      n2o_gwp: ef.n2o_gwp,
      n2o: emissions.n2o_fossil,
      emission: emissions.total,
      plant: selectedPlant
    };
  }).filter(item => item !== null);
};

export const parseGenset = (dataRows, plantId, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const gensetBbm = parseFloat(row[1]) || 0;
    const pemanasanGenset = parseFloat(row[2]) || 0;
    const bbmConsumed = gensetBbm + pemanasanGenset;
    const ef = boilerGenset;
    
    const emissions = emissionCalculations.calculateBoiler(bbmConsumed, ef);
    console.log('bbmConsumed:', bbmConsumed, 'ef:', ef);
      return{
        period,
        bbm: bbmConsumed,
        subArea: 'genset',
        co2_ef_diesel: ef.co2_diesel,
        co2_ef_bio: ef.co2_bio,
        co2_gwp: ef.co2_gwp,
        co2: emissions.co2_total,
        ch4_ef_diesel: ef.ch4_diesel,
        ch4_ef_bio: ef.ch4_bio,
        ch4_gwp: ef.ch4_gwp,
        ch4: emissions.ch4_total,
        n2o_ef_diesel: ef.n2o_diesel,
        n2o_ef_bio: ef.n2o_bio,
        n2o_gwp: ef.n2o_gwp,
        n2o: emissions.n2o_total,
        emission: emissions.total,
        plant: plantId
      };
  }).filter(item => item !== null);
};
  

export const parseMiniBoiler = (dataRows, plantId, selectedYear, isYearOnly, selectedPeriod) => {  
   return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const bbmMiniboiler = parseFloat(row[1]) || 0;
    const ef = boilerGenset;
    
  
      const emissions = emissionCalculations.calculateBoiler(bbmMiniboiler, ef);
      
      return{
        period,
        bbm: bbmMiniboiler,
        subArea: 'mini_boiler',
        co2_ef_diesel: ef.co2_diesel,
        co2_ef_bio: ef.co2_bio,
        co2_gwp: ef.co2_gwp,
        co2: emissions.co2_total,
        ch4_ef_diesel: ef.ch4_diesel,
        ch4_ef_bio: ef.ch4_bio,
        ch4_gwp: ef.ch4_gwp,
        ch4: emissions.ch4_total,
        n2o_ef_diesel: ef.n2o_diesel,
        n2o_ef_bio: ef.n2o_bio,
        n2o_gwp: ef.n2o_gwp,
        n2o: emissions.n2o_total,
        emission: emissions.total,
        plant: plantId
      };
  }).filter(item => item !== null);
};
  

export const parseVehicleTransport = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => { 
 return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const fuel_type = (row[1] || '').toString().trim(); 
    const totalLitre = parseFloat(row[2]);
    
    const efKey = `${fuel_type}`;
    const ef = mobileCombustionFuel[efKey];
    
    if (!ef) {
      console.error(`Row ${index + 1}: Emission factor tidak ditemukan untuk "${efKey}"`);
      return null;
    }

    const emissions = emissionCalculations.calculateVehicleTransport(totalLitre, ef);

    return {
      period,
      subArea: 'vehicle_transport',
      fuel_type,
      totalLitre,
      co2_ef: ef.co2,
      co2_gwp: ef.co2_gwp,
      co2: emissions.co2,
      ch4_ef: ef.ch4,
      ch4_gwp: ef.ch4_gwp,
      ch4: emissions.ch4,
      n2o_ef: ef.n2o,
      n2o_gwp: ef.n2o_gwp,
      n2o: emissions.n2o,
      emission: emissions.total,
      plant: selectedPlant
    };
  }).filter(item => item !== null);
};

export const parseElectricityData = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  console.log('=== PARSING ELECTRICITY DATA ===');
  console.log('Total rows:', dataRows.length);
  
  return dataRows.map((row, index) => {
    const period = determinePeriod(row[1], selectedYear, isYearOnly, selectedPeriod);
    const lwbpRaw = row[2];
    const wbpRaw = row[3];
    
    const lwbp = parseIndonesianNumber(lwbpRaw || 0);
    const wbp = parseIndonesianNumber(wbpRaw || 0);
    
    const totalKWh = lwbp + wbp;
    const totalMWh = totalKWh / 1000;
    
    const emissionFactor = parseFloat(row[5]) || 0.80;
    const gwp = parseFloat(row[6]) || 1.0;
    
    const emission = totalMWh * emissionFactor * gwp;

    const result = {
      period,
      lwbp: isNaN(lwbp) ? 0 : lwbp,
      wbp: isNaN(wbp) ? 0 : wbp,
      totalKWh: isNaN(totalKWh) ? 0 : totalKWh,
      totalMWh: isNaN(totalMWh) ? 0 : totalMWh,
      emissionFactor,
      gwp,
      emission: isNaN(emission) ? 0 : parseFloat(emission),
      plant: selectedPlant
    };
    
    return result;
  });
};

export const parseWwtp = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const population = parseFloat(row[1]);
    const proteinConsumperCapita =  parseFloat(row[2]);
    const sludgeRemoved =  parseFloat(row[3]) || 0;
    const methaneRecovered =  parseFloat(row[4]) || 0;
    const ef = wwtpEmission;

    const emissions = emissionCalculations.calculationWwtp(population, proteinConsumperCapita, ef, sludgeRemoved, methaneRecovered);
    return {
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
      emission: emissions.total,
      plant: selectedPlant
    };
  });
};

export const parseRefrigerant = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const location = row[1] || '-';
    const qty = parseFloat(row[2]) || 0;
    const freonType = (row[3] || '').toString().trim();
    const refrigerantType = (row[4] || '').toString().trim();
    const capacity = parseFloat(row[5]) || 0;

    const efKey = `${freonType}-${refrigerantType}`;
    const emissionFactor = refrigerantEmission[efKey];

    if (!emissionFactor) {
      console.error(`Row ${index + 1}: Emission factor tidak ditemukan untuk "${efKey}"`);
      return null;
    }

    const emissions = emissionCalculations.calculateRefrigerant(capacity, qty, emissionFactor);

    return {
      period,
      location,
      qty,
      freonType,
      refrigerantType,
      capacity,
      capacity_kg: emissions.capacity_kg,
      leakage_rate: emissionFactor.leakage_rate,
      gwp: emissionFactor.gwp,
      emission: emissions.total,
      plant: selectedPlant,
      subArea: 'refrigerant'
    };
  }).filter(item => item !== null);
};

export const parseBusinessTravelData = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const route = row[1] || '-';
    const vehicleType = (row[2] || '').toString().trim();  
    const size = (row[4] || '').toString().trim();         
    const fuel = (row[5] || '').toString().trim(); 
    const distance = parseFloat(row[6]) || 0;
    const efKey = `${vehicleType}-${size}-${fuel}`;
    const ef = vehicleEmissionFactors[efKey];

    if (!ef) {
      console.error(`Row ${index + 1}: Emission factor tidak ditemukan untuk "${efKey}"`);
      return null;
    }
    
    const emissions = emissionCalculations.calculateUpstreamTransport(distance, ef);

    return {
      period,
      route,
      vehicleType,
      size,
      fuel,
      distance, 
      co2_ef: ef.co2,
      co2_gwp: ef.co2_gwp,
      co2: emissions.co2,
      ch4_ef: ef.ch4,
      ch4_gwp: ef.ch4_gwp,
      ch4: emissions.ch4,
      n2o_ef: ef.n2o,
      n2o_gwp: ef.n2o_gwp,
      n2o: emissions.n2o,
      emission: emissions.total,
      plant: selectedPlant
    };
  }).filter(item => item !== null);
};

export const parsePurchasedGoods = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows.map((row, index) => {
    const period = determinePeriod(row[0], selectedYear, isYearOnly, selectedPeriod);
    const materialType = (row[2] || '').toString().trim();
    const qty = parseFloat(row[3]) || 0;
    const ef = purchasedGoodsEmission[materialType];
    const emissions = emissionCalculations.calculatepurchasedGoods(qty, ef);
    
    return{
      period,
      materialType,
      qty,
      co2_ef: ef.co2,
      total_emisi_mg_c: emissions.total_emisi_mg_c,
      faktor_konversi: 3.6667,
      mg_co2_emission: emissions.mg_co2_emission,
      co2_gwp: 1,
      co2: emissions.co2,
      emission: emissions.total,
       plant: selectedPlant
    };
  });
};

export const parseGenericData = (dataRows, selectedPlant, selectedYear, isYearOnly, selectedPeriod) => {
  return dataRows.map((row, index) => {
    const dataValue = parseIndonesianNumber(row[2] || 0);
    const emissionFactor = parseFloat(row[4]) || 1.0;
    const emission = dataValue * emissionFactor;
    
    return {
      period: determinePeriod(row[1], selectedYear, isYearOnly, selectedPeriod),
      data: dataValue,
      unit: row[3] || 'unit',
      emissionFactor,
      emission: isNaN(emission) ? 0 : parseFloat(emission),
      plant: selectedPlant
    };
  });
};

const parseSheet = (worksheet, selectedSubcategory, plantId, selectedYear, isYearOnly, selectedSubArea, selectedPeriod) => {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (jsonData.length < 2) {
    return [];
  }

  const startRowIndex = findHeaderRow(jsonData);
  if (startRowIndex === -1) {
    return [];
  }

  let dataRows = jsonData.slice(startRowIndex + 1).filter(row => 
    row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')
  );

  dataRows = filterDataRows(dataRows, selectedSubcategory);

  if (dataRows.length === 0) {
    return [];
  }

  if (selectedSubcategory === '3.11' || selectedSubcategory === '3.1') {
    return parseTransportData(dataRows, selectedSubcategory, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '2.1') {
    return parseElectricityData(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '3.2') {
    return parseDownstream(dataRows, selectedSubcategory, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '3.5') {
    return parseBusinessTravelData(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '4.1') {
    return parsePurchasedGoods(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '1.1' && selectedSubArea === 'tungku') {
      const isPlantA = plantId === '1' || plantId === 'A' || plantId === 'a' || plantId === 1;
      const isPlantB = plantId === '2' || plantId === 'B' || plantId === 'b' || plantId === 2;
      if (isPlantA) {
        return parseTungku(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
      } else if (isPlantB) {
        return parseTungkuMajalengka(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
      }
  } else if (selectedSubcategory === '1.1' && (selectedSubArea === 'incinerator' || selectedSubArea === 'tungku_boiler')) {
    return parseTungkuMajalengka(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod, selectedSubArea);
  } else if (selectedSubcategory === '1.1' && selectedSubArea === 'genset') {
    return parseGenset(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '1.1' && selectedSubArea === 'mini_boiler') {
    return parseMiniBoiler(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '1.2' && selectedSubArea === 'forklift') {
    return parseForklift(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '1.2' && selectedSubArea === 'vehicle_transport') {
    return parseVehicleTransport(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '1.3') {
    return parseWwtp(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else if (selectedSubcategory === '1.4') {
    return parseRefrigerant(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  } else {
    return parseGenericData(dataRows, plantId, selectedYear, isYearOnly, selectedPeriod);
  }
};

export const parseExcelFile = async (file, selectedSubcategory, selectedPlant, selectedYear, isYearOnly, selectedSubArea, selectedPeriod) => {
  console.log('=== PARSE EXCEL FILE ===');
  console.log('Subcategory:', selectedSubcategory);
  console.log('Selected Plant:', selectedPlant);
  
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  
  console.log('Available sheets:', workbook.SheetNames);
  
  let allResults = [];

  const hasMultipleSheets = workbook.SheetNames.length > 1;
  const detectedPlants = workbook.SheetNames
    .map(name => ({ sheetName: name, plant: detectPlantFromSheetName(name) }))
    .filter(item => item.plant !== null);

  console.log('Detected plants from sheet names:', detectedPlants);

  if (hasMultipleSheets && detectedPlants.length > 0) {
    console.log('Multi sheet mode detected');
    
    for (const { sheetName, plant } of detectedPlants) {
      const detectedSubArea = plant.subArea || selectedSubArea;
      const detectedPlantId = plant.id || selectedPlant;

      console.log(`Processing sheet: ${sheetName} for ${plant.name}`);
      const worksheet = workbook.Sheets[sheetName];
      const results = parseSheet(worksheet, selectedSubcategory, detectedPlantId, selectedYear, isYearOnly, detectedSubArea, selectedPeriod);
      allResults = [...allResults, ...results];
    }

    if (allResults.length === 0) {
      throw new Error('Tidak ada data valid yang ditemukan di semua sheet');
    }
  } else {
    console.log('Single-sheet mode, using selected plant:', selectedPlant);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    allResults = parseSheet(worksheet, selectedSubcategory, selectedPlant, selectedYear, isYearOnly, selectedSubArea, selectedPeriod);

    if (allResults.length === 0) {
      throw new Error('Tidak ada data yang ditemukan dalam file Excel');
    }
  }

  console.log('Total results parsed:', allResults.length);
  return allResults;
};