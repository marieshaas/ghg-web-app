import React, { useState, useEffect } from 'react';
import { DUMMY_SUPPLIER_CLUSTERING, DUMMY_SUPPLIER_PREDICTIONS } from '../../utils/dummyData';
import { API_BASE_URL } from '../../config/emissionconfig';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const SupplierClustering = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantId, setPlantId] = useState('');
  const [removeOutliers, setRemoveOutliers] = useState(true);
  const [predictions, setPredictions] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predSearch, setPredSearch] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadClustering(); }, [plantId, removeOutliers]);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setPredLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/predictions/next-month/suppliers`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      if (result.success) setPredictions(result);
    } catch (error) {
      console.warn('Backend tidak tersedia, menggunakan demo data:', error.message);
      setPredictions(DUMMY_SUPPLIER_PREDICTIONS);
      setIsDemoMode(true);
    } finally {
      setPredLoading(false);
    }
  };

  const loadClustering = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (plantId) params.append('plantId', plantId);
      if (removeOutliers) params.append('removeOutliers', 'true');

      const response = await fetch(
        `${API_BASE_URL}/api/analysis/supplier-clustering?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.warn('Backend tidak tersedia, menggunakan demo data:', error.message);
      setData(DUMMY_SUPPLIER_CLUSTERING);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
  if (!data || !data.suppliers) return { datasets: [] };

  const colorMap = {
    'High Intensity': { bg: '#EF4444', border: '#DC2626' },    // Merah
    'Medium Intensity': { bg: '#F59E0B', border: '#D97706' },  // Orange
    'Low Intensity': { bg: '#10B981', border: '#059669' },     // Hijau
  };

  const datasets = data.clusters.map((cluster) => {
    const intensity = cluster.intensity;
    const color = colorMap[intensity] || { bg: '#6B7280', border: '#4B5563' }; // fallback

    return {
      label: `${intensity} (${cluster.supplier_count} suppliers)`,
      data: data.suppliers
        .filter((s) => s.cluster === cluster.cluster)
        .map((s) => ({
          x: s.frequency,
          y: parseFloat(s.total_emission),
          supplier: s.supplier,
          plant_id: s.plant_id,
          intensity: intensity,
        })),
      backgroundColor: color.bg + 'CC',     // transparan
      borderColor: color.border,
      pointRadius: 8,
      pointHoverRadius: 12,
      pointBackgroundColor: color.bg,
    };
  });

  return { datasets };
};

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const point = ctx.raw;
            return `${point.supplier || 'Supplier'}: ${point.y} tCO2e (${point.x} trips)`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Frequency (Number of Deliveries)', font: { size: 14 } },
        beginAtZero: true,
      },
      y: {
        title: { display: true, text: 'Total Emission (tCO2e)', font: { size: 14 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {isDemoMode && (
          <div className="mt-10 px-4 py-2 bg-amber-100 border border-amber-400 rounded-lg text-amber-800 text-sm font-medium">
            Demo Mode — Backend tidak terhubung. Menampilkan data simulasi.
          </div>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8" style={{ marginTop: isDemoMode ? '1rem' : '' }}>
          <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${isDemoMode ? '' : 'mt-10'}`}>
            Supplier Emission Clustering Analysis
          </h1>
          {data?.computed_at && (
            <p className="mt-1 text-xs text-gray-400">
              Data terakhir diperbarui:{' '}
              {new Date(data.computed_at).toLocaleString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
              })}{' '}
              WIB — dijadwalkan otomatis setiap 3 bulan
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-wrap gap-6 items-center justify-center relative">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Plant</label>
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-lg text-lg focus:ring-4 focus:ring-blue-300"
            >
              <option value="">All Plants</option>
              <option value="1">Plant Bogor</option>
              <option value="2">Plant Majalengka</option>
            </select>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
              <span>Memuat data...</span>
            </div>
          )}
        </div>
       
        <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
            <input
            type="checkbox"
            checked={!removeOutliers}
            onChange={(e) => setRemoveOutliers(!e.target.checked)}
            className="w-6 h-6 text-orange-600"
            />
            <span className="font-bold text-orange-900">
            Industry Mode: Tampilkan semua supplier (termasuk outlier)
            </span>
        </label>
        <p className="text-sm text-orange-700 mt-2 ml-9">
            Outlier = supplier dengan jejak karbon yang secara signifikan lebih tinggi dibandingkan mayoritas supplier lainnya.
        </p>
        </div>

        {data && (
          <>
            {/* Scatter Chart */}
            <div className="bg-white rounded-xl shadow-xl p-8 mb-10" style={{ height: '600px' }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Supplier Clusters: Emission vs Frequency
              </h2>
              <Scatter data={getChartData()} options={chartOptions} />
            </div>

            {/* Cluster Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.clusters.map((cluster) => (
                <div
                  key={cluster.cluster}
                  className="bg-white rounded-xl shadow-xl p-8 border-l-8 transition-transform hover:scale-105"
                  style={{
                    borderLeftColor:
                      cluster.intensity === 'High Intensity'
                        ? '#EF4444'
                        : cluster.intensity === 'Medium Intensity'
                        ? '#f59e0b'
                        : '#10B981',
                  }}
                >
                  <h3 className="text-3xl font-bold mb-6">
                    {cluster.intensity}
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-2xl">
                      <strong>{cluster.supplier_count}</strong> Suppliers
                    </p>
                    <p>
                      <strong>Total Emission:</strong>{' '}
                      <span className="text-xl font-bold text-red-600">
                        {cluster.total_emission.toFixed(1)} tCO2e
                      </span>
                    </p>
                    <p>
                      <strong>Emission per Trip:</strong>{' '}
                      <span className="font-bold">
                        {cluster.emission_per_transaction.toFixed(4)} tCO2e
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Avg {cluster.avg_frequency.toFixed(1)} trips •{' '}
                      {cluster.avg_emission.toFixed(2)} tCO2e per supplier
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SUPPLIER PREDICTION NEXT MONTH */}
        <div className="bg-white rounded-xl shadow-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-teal-700 mb-1 text-center">
            Prediksi Emisi Supplier — Bulan Berjalan
          </h2>
          {predictions && (
            <p className="text-center text-sm text-gray-500 mb-5">
              Estimasi bulan {predictions.next_month} · diurutkan dari emisi tertinggi
            </p>
          )}

          {predLoading && (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent mb-3"></div>
              <p>Memuat prediksi...</p>
            </div>
          )}

          {!predLoading && !predictions && (
            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
              ML service tidak tersedia. Pastikan ml_service.py berjalan.
            </div>
          )}

          {!predLoading && predictions && predictions.suppliers && (() => {
            const filtered = predictions.suppliers
              .map((s, i) => ({ ...s, rank: i + 1 }))
              .filter(s => s.supplier.toLowerCase().includes(predSearch.toLowerCase()));

            return (
              <>
                {/* Search bar */}
                <div className="relative mb-4">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari supplier..."
                    value={predSearch}
                    onChange={e => setPredSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  {predSearch && (
                    <button onClick={() => setPredSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-2 text-right">
                  {filtered.length} supplier{predSearch ? ` ditemukan dari ${predictions.suppliers.length}` : ''}
                </p>

                {/* Scrollable table — 10 rows visible */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-teal-50">
                        <th className="px-6 py-3 text-sm font-bold text-gray-700 w-16">Rank</th>
                        <th className="px-6 py-3 text-sm font-bold text-gray-700">Supplier</th>
                        <th className="px-6 py-3 text-sm font-bold text-gray-700 text-center w-28">Plant</th>
                        <th className="px-6 py-3 text-sm font-bold text-gray-700 text-right w-48">Prediksi Emisi</th>
                      </tr>
                    </thead>
                  </table>
                  <div className="overflow-y-auto" style={{ maxHeight: '440px' }}>
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                              Tidak ada supplier yang cocok dengan "{predSearch}"
                            </td>
                          </tr>
                        ) : (
                          filtered.map((s) => {
                            const plantName = s.plant_id === 1 ? 'Plant A' : s.plant_id === 2 ? 'Plant B' : s.plant_id;
                            return (
                              <tr key={s.rank} className={`border-b hover:bg-teal-50 transition ${s.rank === 1 ? 'bg-teal-50' : ''}`}>
                                <td className="px-6 py-3 w-16">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-white font-bold text-sm ${
                                    s.rank === 1 ? 'bg-teal-600' :
                                    s.rank === 2 ? 'bg-teal-500' :
                                    s.rank === 3 ? 'bg-teal-400' :
                                    'bg-gray-400'
                                  }`}>
                                    #{s.rank}
                                  </span>
                                </td>
                                <td className="px-6 py-3 font-semibold text-gray-800">{s.supplier}</td>
                                <td className="px-6 py-3 text-center text-sm text-gray-600 w-28">{plantName}</td>
                                <td className="px-6 py-3 text-right font-bold text-teal-700 w-48">
                                  {parseFloat(s.predicted_emission).toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} tCO₂e
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* TOP 5 WORST SUPPLIERS RANKING */}
        {data && data.suppliers && (
          <div className="bg-white rounded-xl shadow-xl p-8 mt-12">
            <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">
              Top 5 Suppliers with Highest Emission Impact
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Rank</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Supplier</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 text-center">Plant</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Total Emission</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Trips</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Emission/Trip</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Intensity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.suppliers
                    .sort((a, b) => b.total_emission - a.total_emission) 
                    .slice(0, 5)
                    .map((s, index) => {
                      const intensity = data.clusters.find(c => c.cluster === s.cluster)?.intensity || 'Unknown';
                      const plantName = s.plant_id === 1 ? 'Plant A' : s.plant_id === 2 ? 'Plant B' : 'Unknown';

                      return (
                        <tr
                          key={index}
                          className={`border-b hover:bg-gray-50 transition ${
                            index === 0 ? 'bg-red-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-white font-bold text-lg ${
                              index === 0 ? 'bg-red-600' :
                              index === 1 ? 'bg-orange-500' :
                              index === 2 ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-800 max-w-xs truncate">
                            {s.supplier}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {plantName}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-red-600">
                            {parseFloat(s.total_emission).toFixed(2)} tCO₂e
                          </td>
                          <td className="px-6 py-4 text-right text-gray-700">
                            {s.frequency}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-700">
                            {(s.total_emission / s.frequency).toFixed(4)} tCO₂e
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold ${
                              intensity === 'High Intensity' ? 'bg-red-600' :
                              intensity === 'Medium Intensity' ? 'bg-orange-500' :
                              'bg-green-600'
                            }`}>
                              {intensity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-300">
              <strong>Action Recommendation:</strong> Prioritaskan negosiasi atau penggantian dengan 5 supplier di atas untuk pengurangan emisi tercepat!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierClustering;