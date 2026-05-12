import { useEffect, useState } from "react";
import axios from "axios";
import { DUMMY_AVAILABLE_YEARS, DUMMY_MONTHLY_ROWS, buildDummyMonthlySummary } from "../utils/dummyData";
import { API_BASE_URL } from "../config/emissionconfig";

export default function useMonthlyReport(filters = {}) {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalEmissions: 0,
    totalRecords: 0,
    plantCount: 0,
    categoryCount: 0
  });
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    async function fetchYears() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/emissions/available-years`);
        setAvailableYears(res.data.years || []);
      } catch (err) {
        console.warn("Backend tidak tersedia, menggunakan demo data:", err.message);
        setAvailableYears(DUMMY_AVAILABLE_YEARS);
        setIsDemoMode(true);
      }
    }
    fetchYears();
  }, []);
    
  useEffect(() => {
    async function fetchReport() {
    //   // Don't fetch if no filters selected
    //   if (!filters.month && !filters.year && !filters.plant_id && !filters.category_id) {
    //     setData([]);
    //     return;
    //   }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.plant_id) params.append('plant_id', filters.plant_id);
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);

        const res = await axios.get(`${API_BASE_URL}/api/emissions/monthly-report?${params.toString()}`);
        
        setData(res.data.data || []);
        setSummary(res.data.summary || {
          totalEmissions: 0,
          totalRecords: 0,
          plantCount: 0,
          categoryCount: 0
        });
      } catch (err) {
        console.warn("Backend tidak tersedia, menggunakan demo data:", err.message);
        setIsDemoMode(true);
        setData(DUMMY_MONTHLY_ROWS);
        setSummary(buildDummyMonthlySummary(DUMMY_MONTHLY_ROWS));
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [filters.plant_id, filters.category_id, filters.month, filters.year]);

  return { data, summary, loading, availableYears, error, isDemoMode };
}