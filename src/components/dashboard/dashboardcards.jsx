import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardCards = ({ data, currentYear, previousYear, currentMonth, months }) => {
  const navigate = useNavigate();
  const safeData = {
    grandTotal: {
      current: data?.grandTotal?.current ?? 0,
      previous: data?.grandTotal?.previous ?? 0,
      yoyChange: data?.grandTotal?.yoyChange ?? 0,
    },
    plantData: {
      current: data?.plantData?.current ?? { a: { total: 0 }, b: { total: 0 } },
      previous: data?.plantData?.previous ?? { a: { total: 0 }, b: { total: 0 } }
    },
    nextMonthPrediction: data?.nextMonthPrediction ?? 0,
    highestCategory: {
      code: data?.highestCategory?.code ?? '-',
      current: data?.highestCategory?.current ?? 0,
    },
  };

  return (
    <div className="space-y-6 mb-6 sm:mb-8">
      <div
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 shadow-lg border border-white backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={() => navigate('/monthly-report')}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700">Grand Total Emissions</h3>
              <p className="text-sm text-gray-500">Combined all plants · <span className="text-indigo-500">View report →</span></p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-3xl sm:text-4xl font-bold text-indigo-600">
              {safeData.grandTotal.current.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-base sm:text-lg font-medium text-gray-600">tCO₂e ({currentYear})</p>
            <p className="text-sm text-gray-500 mt-1">
              vs {previousYear}: {safeData.grandTotal.previous.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
              <span className={`ml-2 font-semibold ${safeData.grandTotal.yoyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                ({safeData.grandTotal.yoyChange >= 0 ? '+' : ''}{safeData.grandTotal.yoyChange.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Plant Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PlantCard
          name="Plant A"
          data={safeData.plantData.current.a}
          previousData={safeData.plantData.previous.a}
          currentYear={currentYear}
          previousYear={previousYear}
          color="green"
          onClick={() => navigate('/monthly-report?plant=1')}
        />
        <PlantCard
          name="Plant B"
          data={safeData.plantData.current.b}
          previousData={safeData.plantData.previous.b}
          currentYear={currentYear}
          previousYear={previousYear}
          color="blue"
          onClick={() => navigate('/monthly-report?plant=2')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Year over Year Change"
          subtitle={`${currentYear} vs ${previousYear}`}
          value={`${safeData.grandTotal.yoyChange >= 0 ? '+' : ''}${safeData.grandTotal.yoyChange.toFixed(2)}%`}
          label={safeData.grandTotal.yoyChange >= 0 ? 'increase' : 'decrease'}
          colorClass={safeData.grandTotal.yoyChange >= 0 ? 'amber' : 'green'}
          icon="trend"
          isPositive={safeData.grandTotal.yoyChange < 0}
        />

        <MetricCard
          title="Period"
          subtitle={`Jan - ${months[currentMonth]}`}
          value={`${currentMonth + 1} months`}
          label={`of ${currentYear}`}
          colorClass="purple"
          icon="calendar"
        />

        {/* <MetricCard
          title="Next Month"
          subtitle="Prediction"
          value={safeData.nextMonthPrediction.toFixed(1)}
          label="tCO₂e (estimated)"
          colorClass="cyan"
          icon="chart"
        /> */}

        <MetricCard
          title="Highest"
          subtitle="Category"
          value={safeData.highestCategory.code}
          label={`${safeData.highestCategory.current.toLocaleString('id-ID', { maximumFractionDigits: 10 })} tCO₂e`}
          colorClass="orange"
          icon="fire"
          onClick={() => navigate('/emission-analysis')}
        />

        <MetricCard
          title="Supplier Prediction"
          subtitle="Bulan Berjalan (Transport)"
          value={safeData.nextMonthPrediction > 0 ? safeData.nextMonthPrediction.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '—'}
          label={safeData.nextMonthPrediction > 0 ? 'tCO₂e (estimated)' : 'ML service offline'}
          colorClass="teal"
          icon="truck"
          onClick={() => navigate('/supplier-analysis')}
        />
      </div>

      {/* Category 1.2 Card */}
      {data?.category12 && (
        <div
          className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => navigate('/emission-analysis?category=1.2')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700">Category 1.2</h3>
                <p className="text-sm text-gray-500">Mobile Combustion</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Forklift */}
            <div className="bg-white rounded-xl p-4 shadow">
              <p className="text-xs text-gray-500 mb-1">Forklift</p>
              <p className="text-2xl font-bold text-amber-600">
                {(data.category12.forklift.current || 0).toLocaleString('id-ID', { maximumFractionDigits: 4 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                vs {previousYear}: {(data.category12.forklift.previous || 0).toLocaleString('id-ID', { maximumFractionDigits: 4 })}
              </p>
            </div>

            {/* Vehicle */}
            <div className="bg-white rounded-xl p-4 shadow">
              <p className="text-xs text-gray-500 mb-1">Vehicle Transport</p>
              <p className="text-2xl font-bold text-amber-600">
                {(data.category12.vehicle.current || 0).toLocaleString('id-ID', { maximumFractionDigits: 4 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                vs {previousYear}: {(data.category12.vehicle.previous || 0).toLocaleString('id-ID', { maximumFractionDigits: 4 })}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-amber-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total Category 1.2</span>
              <span className="text-xl font-bold text-amber-600">
                {(data.category12.total.current || 0).toLocaleString('id-ID', { maximumFractionDigits: 4 })} tCO₂e
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{previousYear}</span>
              <span className="text-sm text-gray-600">
                {(data.category12.total.previous || 0).toLocaleString('id-ID', { maximumFractionDigits: 4 })} tCO₂e
                <span className={`ml-2 font-semibold ${data.category12.total.yoyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ({data.category12.total.yoyChange >= 0 ? '+' : ''}{(data.category12.total.yoyChange || 0).toFixed(1)}%)
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
    
  );
};

const PlantCard = ({ name, data, previousData, currentYear, previousYear, color, onClick }) => {
  const colors = {
    green: {
      bg: 'from-white to-green-50',
      border: 'border-green-100',
      text: 'text-green-700',
      icon: 'from-green-500 to-emerald-600',
    },
    blue: {
      bg: 'from-white to-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      icon: 'from-blue-500 to-indigo-600',
    },
  };
  const c = colors[color];

  

  return (
    <div
      className={`bg-gradient-to-br ${c.bg} rounded-2xl p-4 sm:p-6 shadow-lg border ${c.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className={`p-3 bg-gradient-to-br ${c.icon} rounded-xl mr-3 sm:mr-4 shadow-lg flex-shrink-0`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-700 truncate">{name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Total emissions · <span className={`${color === 'green' ? 'text-green-500' : 'text-blue-500'}`}>View report →</span></p>
          </div>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <p className={`text-2xl sm:text-3xl font-bold ${c.text}`}>
            {(data?.total ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-medium text-gray-600">tCO₂e ({currentYear})</p>
          <p className="text-xs text-gray-500 mt-1">
            {previousYear}: {(previousData?.total ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, subtitle, value, label, colorClass, icon, isPositive, onClick }) => {
  const colors = {
    amber: { bg: 'from-white to-amber-50', border: 'border-amber-100', icon: 'from-red-500 to-red-600', iconPos: 'from-green-500 to-emerald-600' },
    purple: { bg: 'from-white to-purple-50', border: 'border-purple-100', icon: 'from-purple-500 to-purple-600' },
    cyan: { bg: 'from-white to-cyan-50', border: 'border-cyan-100', icon: 'from-cyan-500 to-blue-600', text: 'text-cyan-700' },
    orange: { bg: 'from-white to-orange-50', border: 'border-orange-100', icon: 'from-orange-500 to-red-600', text: 'text-orange-600' },
    green: { bg: 'from-white to-green-50', border: 'border-green-100', icon: 'from-green-500 to-emerald-600' },
    teal: { bg: 'from-white to-teal-50', border: 'border-teal-100', icon: 'from-teal-500 to-emerald-600', text: 'text-teal-700' },
  };
  const c = colors[colorClass];

  const icons = {
    trend: isPositive
      ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
      : 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    fire: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    truck: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0120 10.414V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  };

  return (
    <div
      className={`bg-gradient-to-br ${c.bg} rounded-2xl p-4 sm:p-6 shadow-lg border ${c.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className={`p-2.5 sm:p-3 bg-gradient-to-br ${isPositive !== undefined ? (isPositive ? c.iconPos : c.icon) : c.icon} rounded-xl mr-3 shadow-lg flex-shrink-0`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon]} />
          </svg>
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${c.text || (isPositive !== undefined ? (isPositive ? 'text-green-600' : 'text-red-600') : 'text-gray-900')}`}>
        {value}
      </p>
      <p className="text-xs font-medium text-gray-600 mt-1">{label}</p>
    </div>
  );
};

export default React.memo(DashboardCards);
