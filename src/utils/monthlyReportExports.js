import * as XLSX from 'xlsx';

export const exportMonthlyReportToExcel = (data, summary, filters) => {
  try {
    const excelData = data.map(item => ({
      'Plant': item.plant_name,
      'Category': `${item.category_code} - ${item.category_name}`,
      'Subcategory': item.subcategory_code,
      'Sub Area': item.sub_area || '-',
      'Period': item.period || '-',
      'Year': item.year,
      'Month': item.month,
      'Total Emission (tCO2e)': parseFloat(item.total_emission).toFixed(4),
      'Record Count': item.record_count
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 12 }
    ];
    
    const filterText = Object.entries(filters)
      .filter(([key, value]) => value && value !== 'All')
      .map(([key, value]) => `${key}_${value}`)
      .join('_');
    
    const fileName = `Monthly_Report${filterText ? '_' + filterText : ''}_${new Date().getTime()}`;
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    return { success: true };
  } catch (error) {
    console.error('Export to Excel failed:', error);
    return { success: false, error: error.message };
  }
};

export const exportMonthlyReportToPDF = async (data, summary, filters) => {
  try {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Monthly Emissions Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const filterText = Object.entries(filters)
      .filter(([key, value]) => value && value !== 'All')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    if (filterText) {
      doc.text(`Filters: ${filterText}`, 14, 30);
    }
    doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);
    doc.text(`Total Records: ${data.length}`, 14, 42);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Total Emissions: ${summary.totalEmissions.toFixed(4)} tCO2e`, 14, 48);
    doc.text(`Plants: ${summary.plantCount} | Categories: ${summary.categoryCount}`, 14, 54);
    
    const headers = [
      'Plant', 'Category', 'Subcategory', 'Sub Area', 'Period', 
      'Year', 'Month', 'Emission (tCO2e)', 'Records'
    ];
    
    const rows = data.map(item => [
      item.plant_name,
      `${item.category_code} - ${item.category_name.substring(0, 15)}`,
      item.subcategory_code,
      item.sub_area || '-',
      item.period || '-',
      item.year.toString(),
      item.month.toString(),
      parseFloat(item.total_emission).toFixed(4),
      item.record_count.toString()
    ]);
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 65,
      styles: { 
        fontSize: 7,
        cellPadding: 1.5
      },
      headStyles: { 
        fillColor: [34, 197, 94],
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        7: { halign: 'right' },
        8: { halign: 'center' }
      }
    });
    
    const filterSuffix = filterText ? `_${filterText.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    doc.save(`monthly_report${filterSuffix}_${new Date().getTime()}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Export to PDF failed:', error);
    return { success: false, error: error.message };
  }
};