import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EmissionChart = ({ plantData, currentYear, previousYear, currentMonth }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Safety check
  if (!plantData?.current || !plantData?.previous) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border">
        <p className="text-gray-500 text-center">No chart data available</p>
      </div>
    );
  }

  const currentA = plantData.current.a?.trend || Array(12).fill(0);
  const previousA = plantData.previous.a?.trend || Array(12).fill(0);
  const currentB = plantData.current.b?.trend || Array(12).fill(0);
  const previousB = plantData.previous.b?.trend || Array(12).fill(0);

  const chartData = {
    labels: months.slice(0, currentMonth + 1),
    datasets: [
      {
        label: `A ${currentYear}`,
        data: currentA.slice(0, currentMonth + 1),
        borderColor: 'rgb(22, 163, 74)',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        tension: 0.4,
        borderWidth: 5,
        pointRadius: 7,
        pointHoverRadius: 9,
        pointBackgroundColor: 'rgb(22, 163, 74)',
        pointBorderColor: 'white',
        pointBorderWidth: 3,
        fill: true,
      },
      {
        label: `A ${previousYear}`,
        data: previousA.slice(0, currentMonth + 1),
        borderColor: 'rgba(134, 239, 172, 0.6)',
        backgroundColor: 'rgba(134, 239, 172, 0.05)',
        tension: 0.4,
        borderWidth: 3,
        borderDash: [10, 5],
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(134, 239, 172, 0.8)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        fill: false,
      },
      {
        label: `B ${currentYear}`,
        data: currentB.slice(0, currentMonth + 1),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        borderWidth: 5,
        pointRadius: 7,
        pointHoverRadius: 9,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointBorderColor: 'white',
        pointBorderWidth: 3,
        fill: true,
      },
      {
        label: `B ${previousYear}`,
        data: previousB.slice(0, currentMonth + 1),
        borderColor: 'rgba(147, 197, 253, 0.6)',
        backgroundColor: 'rgba(147, 197, 253, 0.05)',
        tension: 0.4,
        borderWidth: 3,
        borderDash: [10, 5],
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(147, 197, 253, 0.8)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        onClick: null,
        labels: { usePointStyle: true, padding: 15, font: { size: 11, weight: '600' } },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)} tCO2e`
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Emissions (tCO2e)', color: '#6B7280', font: { size: 12, weight: '600' } },
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
        ticks: { color: '#6B7280', font: { size: 10 } },
      },
      x: {
        title: { display: true, text: 'Month', color: '#6B7280', font: { size: 12, weight: '600' } },
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
        ticks: { color: '#6B7280', font: { size: 10 } },
      },
    },
    interaction: { intersect: false, mode: 'index' },
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 sm:p-6 lg:p-8 shadow-lg border border-white backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <p className="text-xs sm:text-sm text-gray-500 mb-3">
        {currentYear} vs {previousYear} (Jan - {months[currentMonth]})
      </p>
      <div className="h-56 sm:h-64 lg:h-80 xl:h-96 w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      {/* Mobile Legend */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200 lg:hidden">
        <p className="text-xs font-bold text-gray-700 mb-3">Chart Guide:</p>
        <div className="grid grid-cols-1 gap-2">
          <LegendItem label={`A ${currentYear}`} type="solid" color="#16a34a" />
          <LegendItem label={`A ${previousYear}`} type="dashed" color="rgba(134, 239, 172, 0.6)" />
          <LegendItem label={`B ${currentYear}`} type="solid" color="#2563eb" />
          <LegendItem label={`B ${previousYear}`} type="dashed" color="rgba(147, 197, 253, 0.6)" />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ label, type, color }) => (
  <div className="flex items-center justify-between bg-white p-2 rounded-lg">
    <div className="flex items-center">
      <div 
        className="w-8 h-1 mr-2 rounded" 
        style={type === 'solid' 
          ? { backgroundColor: color }
          : { background: `repeating-linear-gradient(to right, ${color} 0px, ${color} 5px, transparent 5px, transparent 8px)` }
        }
      />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <span className="text-xs text-gray-500">{type === 'solid' ? 'Current Year' : 'Previous Year'}</span>
  </div>
);

export default React.memo(EmissionChart);