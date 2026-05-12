import { useEffect, useState } from "react";
import axios from "axios";
import { DUMMY_DASHBOARD } from "../utils/dummyData";
import { API_BASE_URL } from "../config/emissionconfig";

export default function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fire both requests in parallel — ML service no longer blocks dashboard render
        const [res, predRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/emissions/summary`),
          axios.get(`${API_BASE_URL}/api/predictions/next-month/total`).catch(() => ({ data: { success: false } }))
        ]);
        const { plantSummary, categorySummary, category12Summary, lastUpdated } = res.data;

        // Handle empty database
        if (!plantSummary || plantSummary.length === 0) {
          setData({
            isEmpty: true,
            years: { current: new Date().getFullYear(), previous: new Date().getFullYear() - 1 },
            grandTotal: { current: 0, previous: 0, yoyChange: 0 },
            categories: {},
            highestCategory: { code: '-', current: 0 },
            plantData: {
              current: { a: { trend: Array(12).fill(0), total: 0 }, b: { trend: Array(12).fill(0), total: 0 } },
              previous: { a: { trend: Array(12).fill(0), total: 0 }, b: { trend: Array(12).fill(0), total: 0 } }
            },
            currentMonth: new Date().getMonth(),
            nextMonthPrediction: 0,
            lastUpdated
          });
          setLoading(false);
          return;
        }

        const currentYear = new Date().getFullYear();
        const years = [...new Set(plantSummary.map(d => d.year))].filter(y => y <= currentYear).sort((a, b) => b - a);
        const [dataCurrentYear, dataPreviousYear] = years.slice(0, 2);

        const totalCurrent = plantSummary
          .filter(d => d.year === dataCurrentYear)
          .reduce((sum, d) => sum + parseFloat(d.total_emission || 0), 0);

        const totalPrevious = plantSummary
          .filter(d => d.year === dataPreviousYear)
          .reduce((sum, d) => sum + parseFloat(d.total_emission || 0), 0);

        const growth = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : 0;

        // Process categories
        const categoryGroups = {};
        categorySummary.forEach(item => {
          const key = item.code || 'unknown';
          if (!categoryGroups[key]) {
            categoryGroups[key] = {
              code: key,
              name: item.name || key,
              current: 0,
              previous: 0
            };
          }
          const emission = parseFloat(item.total_emission || 0);
          if (item.year === dataCurrentYear) categoryGroups[key].current += emission;
          else if (item.year === dataPreviousYear) categoryGroups[key].previous += emission;
        });

        Object.values(categoryGroups).forEach(cat => {
          cat.yoyChange = cat.previous > 0 ? ((cat.current - cat.previous) / cat.previous) * 100 : 0;
        });

        const highestCat = Object.values(categoryGroups).reduce((max, cat) => 
          cat.current > max.current ? cat : max, { code: '-', current: 0 }
        );

        // Process plant data
        const processPlant = (year) => {
          const a = Array(12).fill(0);
          const b = Array(12).fill(0);
          
          plantSummary.filter(d => d.year === year).forEach(d => {
            const idx = Math.max(0, Math.min(11, (d.month_num || 1) - 1));
            const emission = parseFloat(d.total_emission || 0);

            if (d.plant_id === 1) a[idx] += emission;
            else if (d.plant_id === 2) b[idx] += emission;
          });

          return {
            a: { trend: a, total: a.reduce((a, b) => a + b, 0) },
            b: { trend: b, total: b.reduce((a, b) => a + b, 0) }
          };
        };

        const category12Data = {
          forklift: { current: 0, previous: 0 },
          vehicle: { current: 0, previous: 0 },
          total: { current: 0, previous: 0, yoyChange: 0 }
        };

        if (category12Summary && category12Summary.length > 0) {
          category12Summary.forEach(d => {
            const emission = parseFloat(d.total_emission || 0);
            const subArea = (d.sub_area || '').toLowerCase();
            
            if (d.year === dataCurrentYear) {
              if (subArea.includes('forklift')) category12Data.forklift.current += emission;
              else if (subArea.includes('vehicle')) category12Data.vehicle.current += emission;
              category12Data.total.current += emission;
            } else if (d.year === dataPreviousYear) {
              if (subArea.includes('forklift')) category12Data.forklift.previous += emission;
              else if (subArea.includes('vehicle')) category12Data.vehicle.previous += emission;
              category12Data.total.previous += emission;
            }
          });

          category12Data.total.yoyChange = category12Data.total.previous > 0 
            ? ((category12Data.total.current - category12Data.total.previous) / category12Data.total.previous) * 100 
            : 0;
        }

        const latestMonth = Math.max(...plantSummary
          .filter(d => d.year === dataCurrentYear)
          .map(d => d.month_num || 1)) - 1;

        // 🔧 DECLARE PREDICTION VARIABLE PROPERLY
        let prediction = 0;

        // Check missing data for categories in current month
        const currentMonthNum = new Date().getMonth() + 1;
        const categoriesInCurrentMonth = new Set(
          categorySummary
            .filter(d => d.year === dataCurrentYear && d.month_num === currentMonthNum)
            .map(d => d.code)
        );

        if (predRes.data.success) {
          prediction = predRes.data.total_predicted || predRes.data.predicted_emission || 0;
        }

        const allCategories = ['1', '2', '3', '4'];
        const missingCategories = allCategories.filter(cat => !categoriesInCurrentMonth.has(cat));

        setData({
          isEmpty: false,
          years: { current: dataCurrentYear, previous: dataPreviousYear },
          grandTotal: { current: totalCurrent, previous: totalPrevious, yoyChange: growth },
          categories: categoryGroups,
          highestCategory: highestCat,
          plantData: {
            current: processPlant(dataCurrentYear),
            previous: processPlant(dataPreviousYear)
          },
          category12: category12Data,
          currentMonth: Math.max(0, latestMonth),
          nextMonthPrediction: prediction,
          lastUpdated,
          missingCategories: missingCategories,
          currentMonthName: new Date().toLocaleString('en', {month: 'long'})
        });
      } catch (error) {
        console.warn("Backend tidak tersedia, menggunakan demo data:", error.message);
        setData(DUMMY_DASHBOARD);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading };
}