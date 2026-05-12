import * as XLSX from 'xlsx';

// Export to Excel
export const exportToExcel = (data, fileName, subcategory) => {
  try {
    const excelData = prepareExcelData(data, subcategory);
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Emission Results');
    
    ws['!cols'] = Object.keys(excelData[0] || {}).map(() => ({ wch: 20 }));
    
    XLSX.writeFile(wb, `${fileName}_${new Date().getTime()}.xlsx`);
    return { success: true };
  } catch (error) {
    console.error('Export to Excel failed:', error);
    return { success: false, error: error.message };
  }
};

// Export to PDF
export const exportToPDF = async (data, totalEmission, subcategory, categoryLabel) => {
  try {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Emission Calculation Report', 14, 20);
    
    // Metadata
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Category: ${categoryLabel}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);
    doc.text(`Total Records: ${data.length}`, 14, 42);
    
    const decimalPlaces = (subcategory === '3.1' || subcategory === '3.11') ? 12 : 3;
    doc.text(`Total Emission: ${totalEmission.toFixed(decimalPlaces)} tCO2e`, 14, 48);
    
    // Prepare table
    const { headers, rows } = preparePDFData(data, subcategory);
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 55,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [34, 197, 94],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    doc.save(`emission_report_${new Date().getTime()}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('Export to PDF failed:', error);
    return { success: false, error: error.message };
  }
};

// // Save to Database
// export const saveToDatabase = async (data, metadata, apiEndpoint) => {
//   try {
//     const payload = {
//       ...metadata,
//       results: data,
//       timestamp: new Date().toISOString()
//     };
    
//     const response = await fetch(apiEndpoint, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const result = await response.json();
//     return { success: true, data: result };
//   } catch (error) {
//     console.error('Save to database failed:', error);
//     return { success: false, error: error.message };
//   }
// };

// Helper functions
const prepareExcelData = (data, subcategory, subArea) => {
  if (subcategory === '1.1' && subArea === 'tungku') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Sub Area': item.subArea,
      'Hari Kerja': item.hariKerja,
      'Factory': item.factory,
      'Berat Debu per Hari': item.beratDebuperHari,
      'CO2 (EF)': item.co2_ef,
      'CO2 (GWP)':item.co2_gwp,
      'CO2': parseFloat(item.co2).toFixed(7),
      'CH4 (EF)': item.ch4_ef,
      'CH4 (GWP)':item.ch4_gwp,
      'CH4': parseFloat(item.ch4).toFixed(12),
      'N2O (EF)': item.n2o_ef,
      'N2O (GWP)':item.n2o_gwp,
      'N2O': parseFloat(item.n2o).toFixed(12),
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '1.1' && subArea === 'boiler_maja') {
  return data.map(item => ({
    'Period': item.period,
    'Plant': item.plant,
    'Sub Area': item.subArea,
    'Total BBM (L)': item.bbm,
    'CO2 Diesel': parseFloat(item.co2_diesel).toFixed(7),
    'CH4 Diesel': parseFloat(item.ch4_diesel).toFixed(12),
    'N2O Diesel': parseFloat(item.n2o_diesel).toFixed(12),
    'CO2 Bio': parseFloat(item.co2_bio).toFixed(7),
    'CH4 Bio': parseFloat(item.ch4_bio).toFixed(12),
    'N2O Bio': parseFloat(item.n2o_bio).toFixed(12),
    'Total (tCO2e)': item.emission
  }));
  } else if (subcategory === '1.1' && (subArea === 'incinerator_maja' || subArea === 'genset' || subArea === 'boiler')) {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Sub Area': item.subArea,
      'Total BBM (L)': item.bbm,
      'CO2 Diesel': parseFloat(item.co2_diesel).toFixed(7),
      'CH4 Diesel': parseFloat(item.ch4_diesel).toFixed(12),
      'N2O Diesel': parseFloat(item.n2o_diesel).toFixed(12),
      'CO2 Bio': parseFloat(item.co2_bio).toFixed(7),
      'CH4 Bio': parseFloat(item.ch4_bio).toFixed(12),
      'N2O Bio': parseFloat(item.n2o_bio).toFixed(12),
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '3.2') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Route': item.route,
      'Vehicle Type': item.vehicleType,
      'Quantity': item.quantity,
      'Distance (km)': item.distance?.toFixed(2),
      'CO2 (EF)': item.co2_ef,
      'CO2 (GWP)': item.co2_gwp,
      'CO2': parseFloat(item.co2).toFixed(7),
      'CH4 (EF)': item.ch4_ef,
      'CH4 (GWP)': item.ch4_gwp,
      'CH4': parseFloat(item.ch4).toFixed(12),
      'N2O (EF)': item.n2o_ef,
      'N2O (GWP)': item.n2o_gwp,
      'N2O': parseFloat(item.n2o).toFixed(12),
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '4.1') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Material Type': item.materialType,
      'Qty': item.qty,
      'CO2 (EF)': item.co2_ef,
      'Total Emisi (mg C)': item.total_emisi_mg_c,
      'Faktor Konversi': item.faktor_konversi,
      'mg CO2 Emission': item.mg_co2_emission,
      'CO2 (GWP)': item.co2_gwp,
      'CO2': parseFloat(item.co2).toFixed(7),
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '1.2' && subArea === 'forklift') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Sub Area': item.subArea,
      'Total Konsumsi BBM': item.consume_bbm,
      'CO2 Fossil (EF)': item.co2_ef_fossil,
      'CO2 Bio (EF)': item.co2_ef_bio,
      'CO2 (GWP)':item.co2_gwp,
      'CO2': parseFloat(item.co2).toFixed(7),
      'CH4 Fossil (EF)': item.ch4_ef,
      'CH4 (GWP)':item.ch4_gwp,
      'CH4': parseFloat(item.ch4).toFixed(12),
      'N2O Fossil (EF)': item.n2o_ef,
      'N2O (GWP)':item.n2o_gwp,
      'N2O': parseFloat(item.n2o).toFixed(12),
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '1.2' && subArea === 'vehicle_transport') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Sub Area': item.subArea,
      'Jenis BBM': item.fuel_type,
      'Total (L)': parseFloat(item.totalLitre).toFixed(2),
      'CO2 (EF)': item.co2_ef,
      'CO2 (GWP)':item.co2_gwp,
      'CO2': parseFloat(item.co2).toFixed(7),
      'CH4 (EF)': item.ch4_ef,
      'CH4 (GWP)':item.ch4_gwp,
      'CH4': parseFloat(item.ch4).toFixed(12),
      'N2O (EF)': item.n2o_ef,
      'N2O (GWP)':item.n2o_gwp,
      'N2O': parseFloat(item.n2o).toFixed(12),
      'Total (tCO2e)': item.emission.toFixed(3)
    }));
  } else if (subcategory === '1.3') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Total Population': item.population,
      'Protein Consumed per Capita': item.proteinConsumperCapita,
      'Organic Degradable Material': parseFloat(item.organicDegradMaterial).toFixed(3),
      'Sludge Removed': item.sludgeRemoved,
      'Methane Recovered': item.methaneRecovered,
      'CH4 (EF)': item.ch4_ef,
      'CH4 (GWP)':item.ch4_gwp,
      'CH4': parseFloat(item.ch4).toFixed(12),
      'N2O (EF)': item.n2o_ef,
      'N2O (GWP)':item.n2o_gwp,
      'N2O': parseFloat(item.n2o).toFixed(12),
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '1.4') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Location': item.location,
      'Freon Type': item.freonType,
      'Refrigerant Type': item.refrigerantType,
      'Quantity': item.qty,
      'Capacity (Kg)': parseFloat(item.capacity_kg).toFixed(2),
      'Leakage Rate (%)': item.leakage_rate,
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '2.1') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Sub Area': item.subArea,
      'LWBP (KWh)': item.lwbp,
      'WBP (KWh)': item.wbp,
      'Total (MWh)': item.totalMWh?.toFixed(3),
      'EF': item.emissionFactor,
      'GWP': item.gwp,
      'Result (tCO2e)': parseFloat(item.emission).toFixed(3)
    }));
  } else if (subcategory === '3.1' || subcategory === '3.11') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Supplier': item.supplier,
      'Vehicle Type': item.vehicleType,
      'Distance (km)': item.distance?.toFixed(2),
      'CO2 (EF)': item.co2_ef,
      'CO2 (GWP)':item.co2_gwp,
      'CO2': parseFloat(item.co2).toFixed(7),
      'CH4 (EF)': item.ch4_ef,
      'CH4 (GWP)':item.ch4_gwp,
      'CH4': parseFloat(item.ch4).toFixed(12),
      'N2O (EF)': item.n2o_ef,
      'N2O (GWP)':item.n2o_gwp,
      'N2O': parseFloat(item.n2o).toFixed(12),
      'Total (tCO2e)': item.emission
    }));
  } else if (subcategory === '3.5') {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Route': item.route,
      'Vehicle Type': item.vehicleType,
      'Distance (km)': item.distance?.toFixed(2),
      'CO2 (EF)': item.co2_ef,
      'CO2 (GWP)':item.co2_gwp,
      'CO2': parseFloat(item.co2).toFixed(7),
      'CH4 (EF)': item.ch4_ef,
      'CH4 (GWP)':item.ch4_gwp,
      'CH4': parseFloat(item.ch4).toFixed(12),
      'N2O (EF)': item.n2o_ef,
      'N2O (GWP)':item.n2o_gwp,
      'N2O': parseFloat(item.n2o).toFixed(12),
      'Total (tCO2e)': item.emission
    }));
  } else {
    return data.map(item => ({
      'Period': item.period,
      'Plant': item.plant,
      'Data': item.data,
      'Unit': item.unit,
      'Emission Factor': item.emissionFactor,
      'Result (tCO2e)': parseFloat(item.emission).toFixed(3)
    }));
  }
};

const preparePDFData = (data, subcategory, subArea) => {
   if (subcategory === '1.1' && subArea === 'tungku') {
  return {
    headers: ['Period', 'Plant', 'Sub Area', 'Hari Kerja', 'Factory', 'Berat Debu per Hari', 
     'CO2 (GWP)', 'CO2', 'CH4 (EF)', 'CH4 (GWP)', 'CH4', 'N2O (EF)', 'N2O (GWP)', 'N2O','Total (tCO2e)' 
    ],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.subArea,
      item.hariKerja,
      item.factory,
      item.beratDebuperHari,
      item.co2_ef,
      item.co2_gwp,
      parseFloat(item.co2).toFixed(7),
      item.ch4_ef,
      item.ch4_gwp,
      parseFloat(item.ch4).toFixed(12),
      item.n2o_ef,
      item.n2o_gwp,
      parseFloat(item.n2o).toFixed(12),
      item.emission
    ])
  };
} else if (subcategory === '1.1' && (subArea === 'boiler_maja' || subArea === 'incinerator_maja' || subArea === 'genset' || subArea === 'boiler')) {
  return {
    headers: ['Period', 'Plant', 'Sub Area', 'BBM (L)', 'CO2 Diesel', 'CH4 Diesel', 'N2O Diesel', 'CO2 Bio', 'CH4 Bio', 'N2O Bio', 'Total (tCO2e)'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.subArea,
      item.bbm,
      parseFloat(item.co2_diesel).toFixed(7),
      parseFloat(item.ch4_diesel).toFixed(12),
      parseFloat(item.n2o_diesel).toFixed(12),
      parseFloat(item.co2_bio).toFixed(7),
      parseFloat(item.ch4_bio).toFixed(12),
      parseFloat(item.n2o_bio).toFixed(12),
      item.emission
    ])
  };
} else if (subcategory === '3.2') {
  return {
    headers: ['Period', 'Plant', 'Route', 'Vehicle', 'Qty', 'Distance', 'CO2 (EF)', 'CO2 (GWP)', 'CO2', 'CH4 (EF)', 'CH4 (GWP)', 'CH4', 'N2O (EF)', 'N2O (GWP)', 'N2O', 'Total (tCO2e)'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.route,
      item.vehicleType,
      item.quantity,
      item.distance?.toFixed(1),
      item.co2_ef,
      item.co2_gwp,
      parseFloat(item.co2).toFixed(7),
      item.ch4_ef,
      item.ch4_gwp,
      parseFloat(item.ch4).toFixed(12),
      item.n2o_ef,
      item.n2o_gwp,
      parseFloat(item.n2o).toFixed(12),
      item.emission
    ])
  };
} else if (subcategory === '4.1') {
  return {
    headers: ['Period', 'Plant', 'Material', 'Qty', 'CO2 EF', 'Total Emisi', 'Faktor Konversi', 'mg CO2', 'Total (tCO2e)'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.materialType,
      item.qty,
      item.co2_ef,
      item.total_emisi_mg_c?.toFixed(3),
      item.faktor_konversi,
      item.mg_co2_emission?.toFixed(3),
      item.emission
    ])
  };
} else if (subcategory === '1.2' && subArea === 'forklift') {
  return {
    headers: ['Period', 'Plant', 'Sub Area', 'Total Konsumsi BBM', 'CO2 Fossil (EF)', 'CO2 Bio (EF)',
     'CO2 (GWP)', 'CO2', 'CH4 Fossil (EF)',  'CH4 (GWP)', 'CH4', 
     'N2O Fossil (EF)', 'N2O (GWP)', 'N2O', 'Total (tCO2e)'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.subArea,
      item.consume_bbm,
      item.co2_ef_fossil,
      item.co2_ef_bio,
      item.co2_gwp,
      parseFloat(item.co2).toFixed(7),
      item.ch4_ef_fossil,
      item.ch4_gwp,
      parseFloat(item.ch4).toFixed(12),
      item.n2o_ef_fossil,
      item.n2o_gwp,
      parseFloat(item.n2o).toFixed(12),
      parseFloat(item.emission).toFixed(3)
    ])
  };
} else if (subcategory === '1.2' && subArea === 'vehicle_transport') {
  return {
    headers: ['Period', 'Plant', 'Sub Area', 'Jenis BBM', 'Total (L)', 'CO2 (EF)',
     'CO2 (GWP)', 'CO2', 'CH4 (EF)',  'CH4 (GWP)', 'CH4', 
     'N2O (EF)', 'N2O (GWP)', 'N2O', 'Total (tCO2e)'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.subArea,
      item.fuel_type,
      parseFloat(item.totalLiter).toFixed(2),
      item.co2_ef,
      item.co2_gwp,
      parseFloat(item.co2).toFixed(7),
      item.ch4_ef,
      item.ch4_gwp,
      parseFloat(item.ch4).toFixed(12),
      item.n2o_ef,
      item.n2o_gwp,
      parseFloat(item.n2o).toFixed(12),
      parseFloat(item.emission).toFixed(3)
    ])
  };
} else if (subcategory === '1.3') {
  return {
    headers: ['Period', 'Plant', 'Total Population', 'Protein Consumed per Capita', 'Organic Degradable Material', 'Sludge Removed',
     'Methane Recovered','CH4 (EF)',  'CH4 (GWP)', 'CH4', 
     'N2O (EF)', 'N2O (GWP)', 'N2O', 'Total (tCO2e)'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.subArea,
      item.fuel_type,
      parseFloat(item.totalLiter).toFixed(2),
      item.co2_ef,
      item.co2_gwp,
      parseFloat(item.co2).toFixed(7),
      item.ch4_ef,
      item.ch4_gwp,
      parseFloat(item.ch4).toFixed(12),
      item.n2o_ef,
      item.n2o_gwp,
      parseFloat(item.n2o).toFixed(12),
      parseFloat(item.emission).toFixed(3)
    ])
  };
} else if (subcategory === '1.4') {
  return {
    headers: ['Period', 'Plant', 'Location', 'Freon Type', 'Refrigerant Type', 'Quantity',
     'Capacity (Kg)','Leakage Rate (%)', 'Total (tCO2e)'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.location,
      item.freonType,
      item.refrigerantType,
      item.qty,
      parseFloat(item.capacity_kg).toFixed(2),
      item.leakage_rate,
      item.emission
    ])
  };
} else if (subcategory === '2.1') {
  return {
    headers: ['Period','Plant', 'Sub Area', 'LWBP', 'WBP', 'Total MWh', 'EF', 'Result'],
    rows: data.map(item => [
      item.period,
      item.plant,
      item.subArea,
      item.lwbp?.toLocaleString(),
      item.wbp?.toLocaleString(),
      item.totalMWh?.toFixed(3),
      item.emissionFactor,
      parseFloat(item.emission).toFixed(3)
    ])
  };
  } else if (subcategory === '3.1' || subcategory === '3.11') {
    return {
      headers: ['Period', 'Plant', 'Supplier', 'Vehicle', 'Distance', 'CO2 (EF)', 
        'CO2 (GWP)', 'CO2', 'CH4 (EF)', 'CH4 (GWP)', 'CH4',
        'N2O (EF)', 'N2O (GWP)', 'N2O','Total (tCO2e)'],
      rows: data.map(item => [
        item.period,
        item.plant,
        item.supplier.substring(0, 20),
        item.vehicleType,
        item.distance?.toFixed(1),
        parseFloat(item.co2).toFixed(7),
        item.ch4_ef,
        item.ch4_gwp,
        parseFloat(item.ch4).toFixed(12),
        item.n2o_ef,
        item.n2o_gwp,
        parseFloat(item.n2o).toFixed(12),
        item.emission
      ])
    };
  } else if (subcategory === '3.5') {
    return {
      headers: ['Period', 'Plant', 'Route', 'Vehicle Type', 'Distance (km)','CO2 (EF)', 
        'CO2 (GWP)', 'CO2', 'CH4 (EF)', 'CH4 (GWP)', 'CH4',
        'N2O (EF)', 'N2O (GWP)', 'N2O','Total (tCO2e)'],
      rows: data.map(item => [
        item.period,
        item.plant,
        item.route,
        item.vehicleType,
        item.distance?.toFixed(1),
        item.co2_ef,
        parseFloat(item.co2).toFixed(7),
        item.ch4_ef,
        item.ch4_gwp,
        parseFloat(item.ch4).toFixed(12),
        item.n2o_ef,
        item.n2o_gwp,
        parseFloat(item.n2o).toFixed(12),
        item.emission
      ])
    };
  } else {
    return {
      headers: ['Period', 'Data', 'Unit', 'EF', 'Result'],
      rows: data.map(item => [
        item.period,
        item.data,
        item.unit,
        item.emissionFactor,
        parseFloat(item.emission).toFixed(3)
      ])
    };
  }
};