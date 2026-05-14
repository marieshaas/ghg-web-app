import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DUMMY_CATEGORY_RANKING, getDummyConsumption, getDummyRecommendations } from '../../utils/dummyData';
import { API_BASE_URL } from '../../config/emissionconfig';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EmissionAnalysis = () => {
  const [searchParams] = useSearchParams();
  const [categoryData, setCategoryData] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [year] = useState(2024);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchCategoryRanking = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analysis/category-ranking?year=${year}`);
      setCategoryData(response.data.data);

      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        analyzeCategory(categoryParam);
      } else if (response.data.data.length > 0) {
        analyzeCategory(response.data.data[0].category_code);
      }
      setLoading(false);
    } catch (error) {
      console.warn('Backend tidak tersedia, menggunakan demo data:', error.message);
      setIsDemoMode(true);
      setCategoryData(DUMMY_CATEGORY_RANKING);
      const firstCode = DUMMY_CATEGORY_RANKING[0].category_code;
      setSelectedCategory(firstCode);
      setConsumptionData(getDummyConsumption(firstCode));
      setRecommendations(getDummyRecommendations(firstCode));
      setLoading(false);
    }
  }, [year, searchParams]);

  useEffect(() => {
    fetchCategoryRanking();
  }, [fetchCategoryRanking]);

  const analyzeCategory = async (categoryCode) => {
    try {
      setSelectedCategory(categoryCode);
      
      // Fetch consumption details
      const consumptionRes = await axios.get(
        `${API_BASE_URL}/api/analysis/consumption-analysis?category=${categoryCode}&year=${year}`
      );
      setConsumptionData(consumptionRes.data.data);
      
      // Fetch recommendations
      const recommendRes = await axios.get(
        `${API_BASE_URL}/api/analysis/recommendations/${categoryCode}?emission_level=high`
      );
      setRecommendations(recommendRes.data.recommendations);
    } catch (error) {
      console.warn('Backend tidak tersedia, menggunakan demo data:', error.message);
      setConsumptionData(getDummyConsumption(categoryCode));
      setRecommendations(getDummyRecommendations(categoryCode));
    }
  };

  // Chart.js data preparation
  const pieChartData = {
    labels: categoryData.map(item => `${item.category_code} - ${item.category_name}`),
    datasets: [
      {
        data: categoryData.map(item => item.total_emission),
        backgroundColor: [
        '#14532d',
        '#299e63',
        '#bbf7d0',
        '#0f766e',
        '#38bdf8',
        '#1e3a8a',
        '#ca8a04',
        '#064e3b',
        '#16a34a',
        '#86efac'
        ],
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} tCO2e (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  const barChartData = {
    labels: consumptionData.map(item => item.sub_area || item.factory || 'Unknown'),
    datasets: [
      {
        label: 'Emissions (tCO2e)',
        data: consumptionData.map(item => parseFloat(item.total_emission || 0)),
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${selectedCategory} - Emission Sources`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const item = consumptionData[context.dataIndex];
            let additionalInfo = [];
            
            if (item.total_fuel) {
              additionalInfo.push(`Fuel: ${item.total_fuel} L`);
            }
            if (item.total_kwh) {
              additionalInfo.push(`Electricity: ${item.total_kwh} kWh`);
            }
            if (item.total_debu) {
              additionalInfo.push(`Debu: ${item.total_debu} kg`);
            }
            
            return additionalInfo;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Emissions (tCO2e)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Source',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading analysis...</div>
        </div>
      </div>
    );
  }

  return (
     <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <   div className="max-w-7xl mx-auto space-y-6">
      {isDemoMode && (
        <div className="mt-10 px-4 py-2 bg-amber-100 border border-amber-400 rounded-lg text-amber-800 text-sm font-medium">
          Demo Mode — Backend tidak terhubung. Menampilkan data simulasi.
        </div>
      )}
      {/* Header */}
       <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${isDemoMode ? '' : 'mt-10'}`}>
          Emission Analysis
        </h1>

      {/* Category Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Highest Emission Contributors</h3>
            <div className="space-y-3">
            {categoryData.slice(0, 5).map((category, index) => (
                <div 
                key={category.category_code}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category.category_code 
                    ? 'bg-blue-100 border-2 border-blue-300' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
                onClick={() => analyzeCategory(category.category_code)}
                >
                <div className="flex justify-between items-center">
                    <div>
                    <h4 className="font-semibold">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index]} {category.category_code}</h4>
                    <p className="text-sm text-gray-600">{category.category_name}</p>
                    </div>
                    <div className="text-right">
                    <p className="font-bold text-lg">{category.total_emission.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{category.percentage}% of total</p>
                    </div>
                </div>
                </div>
            ))}
            </div>
            
            {/* Show remaining categories summary if more than 5
            {categoryData.length > 5 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-medium text-gray-700">Other Categories</h4>
                    <p className="text-sm text-gray-500">{categoryData.length - 5} additional categories</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-600">
                    {categoryData.slice(5).reduce((sum, cat) => sum + cat.total_emission, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                    {categoryData.slice(5).reduce((sum, cat) => sum + parseFloat(cat.percentage), 0).toFixed(1)}% of total
                    </p>
                </div>
                </div>
            </div>
            )} */}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Emission Distribution</h3>
            <div className="flex-1 min-h-[400px]">
            <Pie data={pieChartData} options={pieChartOptions} />
            </div>
        </div>
        </div>

      {/* Detailed Analysis */}
      {selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumption Analysis with Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">
              {selectedCategory} - Root Cause Analysis
            </h3>
            
            {/* Bar Chart */}
            <div className="h-64 mb-4">
              <Bar data={barChartData} options={barChartOptions} />
            </div>

            {/* Detailed List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {consumptionData.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold">{item.sub_area}</h4>
                      {item.fuel_type && <p className="text-sm text-gray-600">Fuel: {item.fuel_type}</p>}
                      {item.factory && <p className="text-sm text-gray-600">Factory: {item.factory}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{parseFloat(item.total_emission || 0).toFixed(2)} tCO2e</p>
                      {item.total_fuel && <p className="text-sm text-gray-500">{item.total_fuel.toLocaleString()} L fuel</p>}
                      {item.total_kwh && <p className="text-sm text-gray-500">{item.total_kwh.toLocaleString()} kWh</p>}
                      {item.total_debu && <p className="text-sm text-gray-500">{item.total_debu.toLocaleString()} kg debu</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">
              💡 Reduction Recommendations
            </h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-blue-900">{rec.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      rec.priority === 1 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Priority {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center">
                      <span className="font-medium text-gray-600">Impact:</span>
                      <span className={`ml-1 px-2 py-1 rounded ${
                        rec.impact === 'High' ? 'bg-green-100 text-green-800' : 
                        rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.impact}
                      </span>
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium text-gray-600">Cost:</span>
                      <span className={`ml-1 px-2 py-1 rounded ${
                        rec.cost === 'High' ? 'bg-red-100 text-red-800' :
                        rec.cost === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.cost}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
     </div>
  </div>
  );
};

export default EmissionAnalysis;