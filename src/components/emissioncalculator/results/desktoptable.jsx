/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { formatNumber } from '../../../utils/format/numberformatter';
import { plants, subAreas } from '../../../config/emissionconfig';

const InfoTooltip = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <span
        className="cursor-help text-blue-500 hover:text-blue-700 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        ℹ️
      </span>
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs font-normal text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </span>
  );
};

const DesktopResultTable = ({ results, subcategory }) => {
 const getSubAreaLabel = (subArea) => {
  if (subcategory === '1.1') {
    const allAreas = [...(subAreas['1.1']['1'] || []), ...(subAreas['1.1']['2'] || [])];
    const area = allAreas.find(s => s.value === subArea);
    return area ? area.label : subArea;
  }
  
  const areas = subAreas[subcategory] || [];
  const area = areas.find(s => s.value === subArea);
  return area ? area.label : subArea;
};

  const isGensetOrBoiler = (subArea) => {
    return subArea === 'genset' || subArea === 'mini_boiler';
  };
  
  const isIncineratorOrBoiler = (subArea) => {
    return subArea === 'incinerator' || subArea === 'tungku_boiler';
  };

  const renderTableHeaders = () => {
    // Transport categories
    if (['3.1', '3.11'].includes(subcategory)) {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Supplier</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Vehicle</th>
          {subcategory === '3.11' && (
            <th className="px-3 py-3 text-right border-b-2 border-gray-300">Distance</th>
          )}
          {subcategory === '3.1' && (
            <>
              <th className="px-3 py-3 text-right border-b-2 border-gray-300">Distance</th>
              <th className="px-3 py-3 text-right border-b-2 border-gray-300">Qty</th>
            </>
          )}
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (EF)
            <InfoTooltip text="Source: IPCC 2006 Guidelines" />
          </th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP)
            <InfoTooltip text="IPCC AR6 (GWP 100)" />
          </th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF)
            <InfoTooltip text="Source: IPCC 2006 Guidelines" />
          </th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP)
            <InfoTooltip text="IPCC AR6 (GWP 100)" />
          </th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF)
            <InfoTooltip text="Source: IPCC 2006 Guidelines" />
          </th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP)
            <InfoTooltip text="IPCC AR6 (GWP 100)" />
          </th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '3.2') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Route</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Vehicle</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Distance</th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (EF)<InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '3.5') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Route</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Vehicle</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Distance</th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (EF)<InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '2.1') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Sub Area</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">LWBP</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">WBP</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Total MWh</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">
            EF <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">
            GWP <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Result</th>
        </tr>
      );
    }

    if (subcategory === '1.1' && results.length > 0 && results[0]?.subArea === 'tungku') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
           <th className="px-3 py-3 text-right border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Sub Area</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Hari Kerja</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Factory</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Debu per Hari</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Debu per Bulan</th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '1.1' && results.length > 0 && isIncineratorOrBoiler(results[0]?.subArea)) {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Sub Area</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Hari Kerja</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Factory</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Debu per Hari</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Debu per Bulan</th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '1.1' && results.length > 0 && isGensetOrBoiler(results[0]?.subArea)) {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Sub Area</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">BBM (L)</th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 EF (Diesel) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 EF (Bio) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 EF (Diesel) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 EF (Bio) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O EF (Diesel) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O EF (Bio) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '1.2' && results.length > 0 && results[0]?.subArea === 'forklift') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Sub Area</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">BBM (L)</th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 EF Diesel <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 EF Bio <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '1.2' && results.length > 0 && results[0]?.subArea === 'vehicle_transport') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Sub Area</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Fuel Type</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Total (L)</th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '1.3') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Population</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Protein/Capita</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Organic Material</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Sludge Removed</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">CH4 Recovered</th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">
            CH4 (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-blue-700 border-b-2 border-gray-300">CH4</th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (EF) <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">
            N2O (GWP) <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-purple-700 border-b-2 border-gray-300">N2O</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '1.4') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Location</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Freon Type</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Refrigerant Type</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Qty</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Capacity (kg)</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Leakage Rate</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">
            GWP  <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    if (subcategory === '4.1') {
      return (
        <tr className="text-xs font-semibold text-gray-700">
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
          <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Material Type</th>
          <th className="px-3 py-3 text-right border-b-2 border-gray-300">Qty (m3)</th>
         <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (EF) <br></br>
            <InfoTooltip text="Source: IPCC 2006 Guidelines" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">
            CO2 (GWP) <br></br>
            <InfoTooltip text="Source: IPCC AR6 (GWP 100)" /></th>
          <th className="px-3 py-3 text-right text-green-700 border-b-2 border-gray-300">CO2</th>
          <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Total</th>
        </tr>
      );
    }

    // Generic header
    return (
      <tr className="text-xs font-semibold text-gray-700">
        <th className="px-3 py-3 text-left border-b-2 border-gray-300">Period</th>
        <th className="px-3 py-3 text-right border-b-2 border-gray-300">Data</th>
        <th className="px-3 py-3 text-left border-b-2 border-gray-300">Unit</th>
        <th className="px-3 py-3 text-right border-b-2 border-gray-300">EF</th>
        <th className="px-3 py-3 text-left border-b-2 border-gray-300">Plant</th>
        <th className="px-3 py-3 text-right font-bold border-b-2 border-gray-300">Result</th>
      </tr>
    );
  };

  const renderTableRow = (result, index) => {
    // Transport categories
    if (['3.1', '3.11'].includes(subcategory)) {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
           <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm">{result.supplier}</td>
          <td className="px-3 py-3 text-sm capitalize">{result.vehicleType}</td>
          {subcategory === '3.11' && (
            <td className="px-3 py-3 text-sm text-right">{formatNumber(result.distance, 2)}</td>
          )}
          {subcategory === '3.1' && (
            <>
              <td className="px-3 py-3 text-sm text-right">{formatNumber(result.distance, 2)}</td>
              <td className="px-3 py-3 text-sm text-right">{formatNumber(result.quantity, 0)}</td>
            </>
          )}
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '3.2') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm">{result.route}</td>
          <td className="px-3 py-3 text-sm capitalize">{result.vehicleType}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.distance, 2)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '4.1') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm capitalize">{result.materialType}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.qty, 2)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '3.5') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{result.route}</td>
          <td className="px-3 py-3 text-sm capitalize">{result.vehicleType}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.distance, 2)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '2.1') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm font-medium capitalize">{getSubAreaLabel(result.subArea)}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.lwbp, 2)}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.wbp, 2)}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.totalMWh, 2)}</td>
          <td className="px-3 py-3 text-sm text-right">{result.emissionFactor}</td>
          <td className="px-3 py-3 text-sm text-right">{result.gwp}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '1.1' && result.subArea === 'tungku') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm font-medium capitalize">{getSubAreaLabel(result.subArea)}</td>
          <td className="px-3 py-3 text-sm text-right">{result.hariKerja}</td>
          <td className="px-3 py-3 text-sm text-right">{result.factory}</td>
          <td className="px-3 py-3 text-sm text-right">{result.beratDebuperHari} kg</td>
          <td className="px-3 py-3 text-sm text-right">{(result.beratDebuperHari * result.hariKerja).toFixed(2)} kg</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '1.1' && isIncineratorOrBoiler(result.subArea)) {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm font-medium capitalize">{getSubAreaLabel(result.subArea)}</td>
          <td className="px-3 py-3 text-sm text-right">{result.hariKerja}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.beratDebuperHari, 2)}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.beratDebuperBulan, 2)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '1.1' && isGensetOrBoiler(result.subArea)) {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm font-medium capitalize">{result.subArea || '-'}</td>
          <td className="px-3 py-3 text-sm text-right">{result.bbm}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef_diesel}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef_bio}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef_diesel}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef_bio}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef_diesel}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef_bio}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '1.2' && result.subArea === 'forklift') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm font-medium capitalize">{result.subArea || '-'}</td>
          <td className="px-3 py-3 text-sm text-right">{result.consume_bbm}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef_fossil}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef_bio}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef_fossil}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef_fossil}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '1.2' && result.subArea === 'vehicle_transport') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
           <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm font-medium capitalize">{getSubAreaLabel(result.subArea)}</td>
          <td className="px-3 py-3 text-sm text-right">{result.fuel_type}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.totalLitre, 2)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.co2_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-green-600 font-mono">{formatNumber(result.co2, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '1.3') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm text-right">{result.population}</td>
          <td className="px-3 py-3 text-sm text-right">{result.proteinConsumperCapita}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.organicDegradMaterial, 3)}</td>
          <td className="px-3 py-3 text-sm text-right">{result.sludgeRemoved}</td>
          <td className="px-3 py-3 text-sm text-right">{result.methaneRecovered}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.ch4_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-blue-600 font-mono">{formatNumber(result.ch4, 4)}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_ef}</td>
          <td className="px-3 py-3 text-xs text-right text-gray-600">{result.n2o_gwp}</td>
          <td className="px-3 py-3 text-xs text-right text-purple-600 font-mono">{formatNumber(result.n2o, 4)}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    if (subcategory === '1.4') {
      return (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
          <td className="px-3 py-3 text-sm">{plants.find(p => p.value.toLowerCase() === result.plant?.toLowerCase())?.label}</td>
          <td className="px-3 py-3 text-sm text-right">{result.location}</td>
          <td className="px-3 py-3 text-sm text-right">{result.freonType}</td>
          <td className="px-3 py-3 text-sm text-right">{result.refrigerantType}</td>
          <td className="px-3 py-3 text-sm text-right">{result.qty}</td>
          <td className="px-3 py-3 text-sm text-right">{formatNumber(result.capacity_kg, 2)}</td>
          <td className="px-3 py-3 text-sm text-right">{result.leakage_rate}</td>
          <td className="px-3 py-3 text-sm text-right">{result.gwp}</td>
          <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 4)}</td>
        </tr>
      );
    }

    // Generic row
    return (
      <tr key={index} className="hover:bg-blue-50 transition-colors">
        <td className="px-3 py-3 text-sm font-medium">{result.period}</td>
        <td className="px-3 py-3 text-sm text-right">{result.data?.toLocaleString('id-ID')}</td>
        <td className="px-3 py-3 text-sm">{result.unit}</td>
        <td className="px-3 py-3 text-sm text-right">{result.emissionFactor}</td>
        <td className="px-3 py-3 text-sm">{plants.find(p => p.value === result.plant)?.label}</td>
        <td className="px-3 py-3 text-sm text-right font-bold text-green-600">{formatNumber(result.emission, 3)}</td>
      </tr>
    );
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
      <div className="max-h-[600px] overflow-y-auto">
        <table className="min-w-full bg-white relative">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0 z-10 shadow-sm">
            {renderTableHeaders()}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.length > 0 ? (
              results.map((result, index) => renderTableRow(result, index))
            ) : (
              <tr>
                <td colSpan="14" className="px-3 py-12 text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="font-medium">No calculation results yet</p>
                  <p className="text-sm mt-1">Upload data and calculate to see results</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {results.length > 0 && (
        <div className="bg-gray-50 px-4 py-2 text-center text-xs text-gray-600 border-t border-gray-200">
          Showing {results.length} records total
          {results.length > 10 && " - Scroll to see all data"}
        </div>
      )}
    </div>
  );
};

export default DesktopResultTable;