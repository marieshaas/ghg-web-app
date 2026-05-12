import { API_BASE_URL } from '../config/emissionconfig';
const API_BASE = `${API_BASE_URL}/api`;

export const checkDuplicate = async (metadata) => {
  try {
    const { selectedPlant, selectedSubcategory, selectedYear, selectedMonth } = metadata;
    
    const params = new URLSearchParams({
      plant_id: selectedPlant,
      subcategory_id: selectedSubcategory,
      year: selectedYear,
      month: selectedMonth || 0,
    });

    const response = await fetch(`${API_BASE}/emissions/check-duplicate?${params}`);
    
    if (!response.ok) return { isDuplicate: false };
    
    const result = await response.json();
    return { isDuplicate: result.exists === true, data: result };
  } catch (error) {
    console.error('Check duplicate failed:', error);
    return { isDuplicate: false };
  }
};

export const saveToDatabase = async (results, metadata) => {
  try {
    const { selectedPlant, selectedSubcategory, selectedSubArea, selectedPeriod, selectedYear, selectedMonth } = metadata;

    const formData = new FormData();
    formData.append('plant_id', selectedPlant);
    formData.append('subcategory_id', selectedSubcategory);
    formData.append('period', selectedPeriod);
    formData.append('year', selectedYear);
    formData.append('month', selectedMonth || 0);
    formData.append('sub_area', selectedSubArea || 0);
    formData.append('results', JSON.stringify(results));

    const response = await fetch(`${API_BASE}/emissions/batch`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Save to database failed:', error);
    return { success: false, error: error.message };
  }
};