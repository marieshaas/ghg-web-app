import React from 'react';
import { formatNumber } from '../../../utils/format/numberformatter';
import { plants } from '../../../config/emissionconfig';

const isGensetOrBoiler = (subArea) => {
    return subArea === 'genset' || subArea === 'mini_boiler';
  };

const MobileResultCards = ({ results, subcategory }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="font-medium">No results yet</p>
        <p className="text-sm mt-1">Upload data and calculate to see results</p>
      </div>
    );
  }

  const renderCard = (result, index) => {
    // Transport categories (3.1, 3.11, 3.5)
    if (['3.1', '3.11', '3.2','3.5'].includes(subcategory)) {
      return (
        <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
          <div className="flex justify-between mb-3 border-b pb-2">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-gray-800">{result.period}</div>
              <div className="text-xs text-gray-500 truncate">
                {result.supplier || result.route || '-'}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-base font-bold text-green-600">{formatNumber(result.emission, 10)}</div>
              <div className="text-xs text-gray-500">tCO2e</div>
            </div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium">{result.vehicleType}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">{result.distance?.toFixed(1)} km</span>
            </div>

            {subcategory === '3.1' && (
              <>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{result.quantity}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Total Distance:</span>
                  <span className="font-medium">{result.totalDistance?.toFixed(1)} km</span>
                </div>
              </>
            )}
            
            <div className="mt-3 space-y-1.5">
              <div className="bg-green-50 p-2 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-green-700 font-medium">CO2:</span>
                  <span className="text-green-700 font-mono text-xs">{formatNumber(result.co2, 8)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>EF: {result.co2_ef}</span>
                  <span>GWP: {result.co2_gwp}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-2 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-700 font-medium">CH4:</span>
                  <span className="text-blue-700 font-mono text-xs">{formatNumber(result.ch4, 10)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>EF: {result.ch4_ef}</span>
                  <span>GWP: {result.ch4_gwp}</span>
                </div>
              </div>
              
              <div className="bg-purple-50 p-2 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-purple-700 font-medium">N2O:</span>
                  <span className="text-purple-700 font-mono text-xs">{formatNumber(result.n2o, 10)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>EF: {result.n2o_ef}</span>
                  <span>GWP: {result.n2o_gwp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (subcategory === '2.1') {
     return (
    <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between mb-3 border-b pb-2">
        <div>
          <div className="font-bold text-sm">{result.period}</div>
          {result.subArea && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
              {result.subArea}
            </span>
          )}
        </div>
        <span className="text-lg font-bold text-green-600">{formatNumber(result.emission, 4)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600">LWBP</div>
          <div className="font-medium">{result.lwbp?.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">WBP</div>
              <div className="font-medium">{result.wbp?.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Total MWh</div>
              <div className="font-medium">{result.totalMWh?.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Plant</div>
              <div className="font-medium">{plants.find(p => p.value === result.plant)?.label}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">EF</div>
              <div className="font-medium">{result.emissionFactor}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">GWP</div>
              <div className="font-medium">{result.gwp}</div>
            </div>
          </div>
        </div>
      );
    }

    if (subcategory === '1.1' && result.subArea === 'tungku') {
      return (
        <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
          <div className="flex justify-between mb-3 border-b pb-2">
            <div>
              <div className="font-bold text-sm">{result.period}</div>
              <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium capitalize">
                {result.subArea}
              </span>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-green-600">{formatNumber(result.emission, 4)}</div>
              <div className="text-xs text-gray-500">tCO2e</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Hari Kerja</div>
              <div className="font-medium">{result.hariKerja} hari</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Factory</div>
              <div className="font-medium">{result.factory}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Debu/Hari</div>
              <div className="font-medium">{result.beratDebuperHari} kg</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Debu/Bulan</div>
              <div className="font-medium">{(result.beratDebuperHari * result.hariKerja).toFixed(2)} kg</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="bg-green-50 p-2 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-green-700 font-medium">CO2:</span>
                <span className="text-green-700 font-mono text-xs">{formatNumber(result.co2, 4)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>EF: {result.co2_ef}</span>
                <span>GWP: {result.co2_gwp}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-700 font-medium">CH4:</span>
                <span className="text-blue-700 font-mono text-xs">{formatNumber(result.ch4, 4)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>EF: {result.ch4_ef}</span>
                <span>GWP: {result.ch4_gwp}</span>
              </div>
            </div>
            
            <div className="bg-purple-50 p-2 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-purple-700 font-medium">N2O:</span>
                <span className="text-purple-700 font-mono text-xs">{formatNumber(result.n2o, 4)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>EF: {result.n2o_ef}</span>
                <span>GWP: {result.n2o_gwp}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

if (subcategory === '1.1' && isGensetOrBoiler(result.subArea)) {
  return (
    <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between mb-3 border-b pb-2">
        <div>
          <div className="font-bold text-sm">{result.period}</div>
          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium capitalize">
            {result.plant} {result.subArea}
          </span>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-green-600">{formatNumber(result.emission, 10)}</div>
          <div className="text-xs text-gray-500">tCO2e</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 text-xs mb-3">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600">Konsumsi BBM</div>
          <div className="font-medium">{result.bbm} Liter</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="bg-green-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-green-700 font-medium">CO2:</span>
            <span className="text-green-700 font-mono text-xs">{formatNumber(result.co2, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Diesel: {result.co2_ef_diesel}</span>
            <span>EF Bio: {result.co2_ef_bio}</span>
          </div>
          <div className="text-[10px] text-gray-600 text-right mt-0.5">
            GWP: {result.co2_gwp}
          </div>
        </div>
        
        <div className="bg-blue-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-700 font-medium">CH4:</span>
            <span className="text-blue-700 font-mono text-xs">{formatNumber(result.ch4, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Diesel: {result.ch4_ef_diesel}</span>
            <span>EF Bio: {result.ch4_ef_bio}</span>
            <span>GWP: {result.ch4_gwp}</span>
          </div>
        </div>
        
        <div className="bg-purple-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-purple-700 font-medium">N2O:</span>
            <span className="text-purple-700 font-mono text-xs">{formatNumber(result.n2o, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Diesel: {result.n2o_ef_diesel}</span>
            <span>EF Bio: {result.n2o_ef_bio}</span>
            <span>GWP: {result.n2o_gwp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

if (subcategory === '1.2' && result.subArea === 'forklift') {
  return (
    <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between mb-3 border-b pb-2">
        <div>
          <div className="font-bold text-sm">{result.period}</div>
          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium capitalize">
            {result.plant} {result.subArea}
          </span>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-green-600">{formatNumber(result.emission, 10)}</div>
          <div className="text-xs text-gray-500">tCO2e</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 text-xs mb-3">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600">Konsumsi BBM</div>
          <div className="font-medium">{result.consume_bbm} Liter</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="bg-green-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-green-700 font-medium">CO2:</span>
            <span className="text-green-700 font-mono text-xs">{formatNumber(result.co2, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Fossil: {result.co2_ef_fossil}</span>
            <span>EF Bio: {result.co2_ef_bio}</span>
          </div>
          <div className="text-[10px] text-gray-600 text-right mt-0.5">
            GWP: {result.co2_gwp}
          </div>
        </div>
        
        <div className="bg-blue-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-700 font-medium">CH4:</span>
            <span className="text-blue-700 font-mono text-xs">{formatNumber(result.ch4, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Fossil: {result.ch4_ef_fossil}</span>
            <span>GWP: {result.ch4_gwp}</span>
          </div>
        </div>
        
        <div className="bg-purple-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-purple-700 font-medium">N2O:</span>
            <span className="text-purple-700 font-mono text-xs">{formatNumber(result.n2o, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Fossil: {result.n2o_ef_fossil}</span>
            <span>GWP: {result.n2o_gwp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

if (subcategory === '1.2' && result.subArea === 'vehicle_transport') {
  return (
    <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between mb-3 border-b pb-2">
        <div>
          <div className="font-bold text-sm">{result.period}</div>
          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium capitalize">
            {result.subArea}
          </span>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-green-600">{formatNumber(result.emission, 10)}</div>
          <div className="text-xs text-gray-500">tCO2e</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 text-xs mb-3">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600">Total Liter</div>
          <div className="font-medium">{result.totalLitre} Liter</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="bg-green-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-green-700 font-medium">CO2:</span>
            <span className="text-green-700 font-mono text-xs">{formatNumber(result.co2, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Fossil: {result.co2_ef}</span>
          </div>
          <div className="text-[10px] text-gray-600 text-right mt-0.5">
            GWP: {result.co2_gwp}
          </div>
        </div>
        
        <div className="bg-blue-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-700 font-medium">CH4:</span>
            <span className="text-blue-700 font-mono text-xs">{formatNumber(result.ch4, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Fossil: {result.ch4_ef}</span>
            <span>GWP: {result.ch4_gwp}</span>
          </div>
        </div>
        
        <div className="bg-purple-50 p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-purple-700 font-medium">N2O:</span>
            <span className="text-purple-700 font-mono text-xs">{formatNumber(result.n2o, 10)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>EF Fossil: {result.n2o_ef}</span>
            <span>GWP: {result.n2o_gwp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (subcategory === '1.3') {
     return (
    <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between mb-3 border-b pb-2">
          <div className="font-bold text-sm">{result.period}</div>
        <span className="text-lg font-bold text-green-600">{formatNumber(result.emission, 4)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600">Population</div>
          <div className="font-medium">{result.population?.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Protein Consumption per Capita</div>
              <div className="font-medium">{result.proteinConsumperCapita?.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Organic Degradable Material in Waste Water</div>
              <div className="font-medium">{formatNumber(result.organicDegradMaterial, 3)}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Sludge Removed</div>
              <div className="font-medium">{result.sludgeRemoved}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Methane Recovered</div>
              <div className="font-medium">{result.methaneRecovered}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Plant</div>
              <div className="font-medium">{plants.find(p => p.value === result.plant)?.label}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">EF</div>
              <div className="font-medium">{result.emissionFactor}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">GWP</div>
              <div className="font-medium">{result.gwp}</div>
            </div>
          </div>
        </div>
      );
    }

  if (subcategory === '1.4') {
     return (
    <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between mb-3 border-b pb-2">
          <div className="font-bold text-sm">{result.period}</div>
        <span className="text-lg font-bold text-green-600">{formatNumber(result.emission, 4)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 p-2 rounded">
           <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Plant</div>
              <div className="font-medium">{plants.find(p => p.value === result.plant)?.label}</div>
            </div>
          <div className="text-gray-600">Location</div>
          <div className="font-medium">{result.location}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Quantity</div>
              <div className="font-medium">{result.qty}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Freon Type</div>
              <div className="font-medium">{result.freonType}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Refrigerant Type</div>
              <div className="font-medium">{result.refrigerantType}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Capacity (kg)</div>
              <div className="font-medium">{formatNumber(result.capacity_kg, 2)}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">Leakage Rate (%)</div>
              <div className="font-medium">{result.leakage_rate}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">EF</div>
              <div className="font-medium">{result.ef}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">GWP</div>
              <div className="font-medium">{result.gwp}</div>
            </div>
          </div>
        </div>
      );
    }

    // Generic categories
    return (
      <div key={index} className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
        <div className="flex justify-between mb-3 border-b pb-2">
          <span className="font-bold text-sm">{result.period}</span>
          <span className="text-lg font-bold text-green-600">{formatNumber(result.emission, 4, 4)}</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium">{result.data?.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Unit:</span>
            <span className="font-medium">{result.unit}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">EF:</span>
            <span className="font-medium">{result.emissionFactor}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Plant:</span>
            <span className="font-medium">{plants.find(p => p.value === result.plant)?.label}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
      {results.map((result, index) => renderCard(result, index))}
      {results.length > 15 && (
        <div className="text-center py-3 text-sm text-gray-500 bg-gray-50 rounded-lg sticky bottom-0">
          Showing all {results.length} records - Scroll to see more
        </div>
      )}
    </div>
  );
};

export default MobileResultCards;