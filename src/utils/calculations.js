export const emissionCalculations = {
  // Category 3.1 & 3.11: Upstream Transport (CO2 + CH4 + N2O)
  // Category 3.5: Business Travel
  calculateUpstreamTransport: (distance, emissionFactors) => {
    const co2_kg = distance * emissionFactors.co2;
    const co2_ton = (co2_kg * emissionFactors.co2_gwp) / 1000;
    
    const ch4_g = distance * emissionFactors.ch4;
    const ch4_ton_co2e = (ch4_g/1000000) * emissionFactors.ch4_gwp;
    
    const n2o_g = distance * emissionFactors.n2o;
    const n2o_ton_co2e = (n2o_g/1000000) * emissionFactors.n2o_gwp;
    
    return {
      co2: co2_ton,
      ch4: ch4_ton_co2e,
      n2o: n2o_ton_co2e,
      total: (co2_ton + ch4_ton_co2e + n2o_ton_co2e)
    };
  },

  // Category 2.1: Electricity
  calculateElectricity: (lwbp, wbp, emissionFactor, gwp) => {
    const totalMWh = (lwbp + wbp) / 1000;
    return totalMWh * emissionFactor * gwp;
  },

  // Category 1.1: Stationery Combustion - Boiler & Genset
 calculateBoiler: (bbm, emissionFactors) => {
    // Diesel (65%)
    const convert_bbm_diesel = (bbm * 0.65)/1000;
    const berat_kg_diesel = convert_bbm_diesel * emissionFactors.beratJenisBBM_diesel;
    const data_act_diesel =  (berat_kg_diesel / 1000000) * emissionFactors.kaloriBersihBBM_diesel;

    const co2_diesel = ((data_act_diesel * emissionFactors.co2_diesel)  * emissionFactors.co2_gwp)/1000;
    const ch4_diesel = ((data_act_diesel * emissionFactors.ch4_diesel)  * emissionFactors.ch4_gwp)/1000;
    const n2o_diesel = ((data_act_diesel * emissionFactors.n2o_diesel)  * emissionFactors.n2o_gwp)/1000;

    // Bio (35%)
    const convert_bbm_bio = (bbm * 0.35)/1000;
    const berat_kg_bio = convert_bbm_bio * emissionFactors.beratJenisBBM_bio;
    const data_act_bio =  (berat_kg_bio / 1000000) * emissionFactors.kaloriBersihBBM_bio;

    const co2_bio = ((data_act_bio * emissionFactors.co2_bio)  * emissionFactors.co2_gwp)/1000;
    const ch4_bio = ((data_act_bio * emissionFactors.ch4_bio)  * emissionFactors.ch4_gwp)/1000;
    const n2o_bio = ((data_act_bio * emissionFactors.n2o_bio)  * emissionFactors.n2o_gwp)/1000;
    
    const co2_total = co2_diesel + co2_bio;
    const ch4_total = ch4_diesel + ch4_bio;
    const n2o_total = n2o_diesel + n2o_bio;
    const total = co2_total + ch4_total + n2o_total;

    return {
      co2_diesel,
      ch4_diesel,
      n2o_diesel,
      co2_bio,
      ch4_bio,
      n2o_bio,
      co2_total,
      ch4_total,
      n2o_total,
      total
    };
  },

    // Category 1.1: Stationery Combustion - Tungku
   calculateTungku: (beratDebuperHari, hariKerja, emissionFactors) => {
      const debuPerBulanKg = beratDebuperHari * hariKerja;
      
      const debuTon = debuPerBulanKg / 1000;
      
      const co2_kg = debuTon * emissionFactors.co2 * emissionFactors.co2_gwp;
      const ch4_kg = debuTon * emissionFactors.ch4 * emissionFactors.ch4_gwp;
      const n2o_kg = debuTon * emissionFactors.n2o * emissionFactors.n2o_gwp;
      
      return {
        debuPerBulanKg,
        co2: co2_kg/1000,
        ch4: ch4_kg/1000,
        n2o: n2o_kg/1000,
        total: (co2_kg + ch4_kg + n2o_kg)/1000
      };
    },

    // Category 1.2: Mobile Combustion - Forklift
    calculateForklift: (consume_bbm, emissionFactors) => {
      const convert_gallon = consume_bbm * 0.2641;
      const convert_fossil = convert_gallon * 0.65;
      const convert_bio = convert_gallon * 0.35;

      const co2_fossil = (convert_fossil * emissionFactors.co2_fossil /1000) * emissionFactors.co2_gwp;
      const ch4_fossil = (convert_fossil * emissionFactors.ch4_fossil /1000000) * emissionFactors.ch4_gwp;
      const n2o_fossil = (convert_fossil * emissionFactors.n2o_fossil /1000000) * emissionFactors.n2o_gwp;

      const co2_bio = (convert_bio * emissionFactors.co2_bio /1000) * emissionFactors.co2_gwp;

      return {
        co2_fossil,
        co2_bio,
        ch4_fossil,
        n2o_fossil,
        co2_total: co2_fossil + co2_bio,
        total: co2_fossil + co2_bio + ch4_fossil + n2o_fossil
      };
    },

    // Category 1.2: Mobile Combustion - Vehicle Transport
    calculateVehicleTransport: (totalLitre, emissionFactors) => {
      const convert_gallon = totalLitre * 0.2641;

      const co2_ton = (convert_gallon * emissionFactors.co2 /1000) * emissionFactors.co2_gwp;
      const ch4_ton = (convert_gallon * emissionFactors.ch4 /1000000) * emissionFactors.ch4_gwp;
      const n2o_ton = (convert_gallon * emissionFactors.n2o /1000000) * emissionFactors.n2o_gwp;

      return {
        co2: co2_ton,
        ch4: ch4_ton,
        n2o: n2o_ton,
        total: (co2_ton + ch4_ton + n2o_ton) 
      };
    },
  
    // Category 1.4: Refrigerant Emissions
    calculateRefrigerant: (capacity, qty, emissionFactors) => {
      const capacity_kg = capacity/1000;
      const total_emission =  capacity_kg * qty * emissionFactors.leakage_rate * emissionFactors.gwp * 0.001;

      return {
        capacity_kg,
        total: total_emission
    };
  },

   // Category 1.3: Fugitive Emissions
  calculationWwtp: (population, proteinConsumperCapita, emissionFactors, sludgeRemoved = 0, methaneRecovered = 0, emisWasteWater = 0, nsludge = 0) => {
    const organicDegradMaterial = population * emissionFactors.degradOrganicComp * emissionFactors.correctFactor;
    const calc_ch4 = (emissionFactors.fractionPopulation * emissionFactors.degreeUtilization * emissionFactors.ch4) * (organicDegradMaterial - sludgeRemoved) - methaneRecovered;
    const ch4_emissions = (calc_ch4/1000) * emissionFactors.ch4_gwp;
    
    const n_eff = (population * proteinConsumperCapita * emissionFactors.nitroinProte * emissionFactors.f_non_com * emissionFactors.find_con) - nsludge;
    const n2o_calc = (n_eff * emissionFactors.n2o * emissionFactors.n2o_convert) - emisWasteWater;
    const n2o_emissions = (n2o_calc/1000) * emissionFactors.n2o_gwp;

    return {
      organicDegradMaterial,
      ch4: ch4_emissions,
      n2o: n2o_emissions,
      total: ch4_emissions + n2o_emissions
    };
  },

  calculatepurchasedGoods: (qty, emissionFactor) => {
    const total_emisi_mg_c = qty * emissionFactor.co2;
    const faktor_konversi = 3.6667;
    const mg_co2_emission = total_emisi_mg_c * faktor_konversi;
    const total_tonCO2e = (mg_co2_emission / 1000000000) * 1;

    return {
      total_emisi_mg_c,
      mg_co2_emission,
      co2:total_tonCO2e,
      total: total_tonCO2e
  };
}
};


// Emission factor reference data
export const boilerGenset = {
    co2_diesel: 74100,
    ch4_diesel: 10,
    n2o_diesel: 0.60,
    kaloriBersihBBM_diesel: 43,
    beratJenisBBM_diesel: 913.2805240,
    co2_bio: 70800,
    ch4_bio: 10,
    n2o_bio: 0.60,
    kaloriBersihBBM_bio: 27,
    beratJenisBBM_bio: 913.2805240,
    co2_gwp: 1,
    ch4_gwp: 27.9,
    n2o_gwp: 273,
};

export const tungku = {
  co2: 1747.2,
  ch4: 4.68,
  n2o: 0.06,
  co2_gwp: 1,
  ch4_gwp: 27,
  n2o_gwp: 273
};

export const forklift = {
  co2_fossil: 10.21,
  co2_bio: 9.45,
  ch4_fossil: 0.42,
  n2o_fossil: 0.6,
  co2_gwp: 1,
  ch4_gwp: 29.8,
  n2o_gwp: 273
};

export const mobileCombustionFuel = {
  'PERTAMINA - Pertalite': {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'PERTAMINA - Pertamax' : {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'PERTAMINA - Pertamax Turbo' : {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'PERTAMINA - Pertamax Green' : {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'PERTAMINA - Pertamina Dex' : {
    fuelType: 'Diesel',
    co2: 10.21, // kg/US gallon
    ch4: 0.42,  // g/US gallon
    n2o: 0.6,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'PERTAMINA - Bio Solar' : {
    fuelType: 'Biodiesel',
    co2: 9.45, // kg/US gallon
    ch4: 0.42,  // g/US gallon
    n2o: 0.6,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'PERTAMINA - Dexlite' : {
    fuelType: 'Diesel',
    co2: 10.21, // kg/US gallon
    ch4: 0.42,  // g/US gallon
    n2o: 0.6,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'SHELL - Super' : {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'SHELL - V-Power' : {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'SHELL - V-Power Nitro+' : {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'SHELL - V-Power Diesel' : {
    fuelType: 'Diesel',
    co2: 10.21, // kg/US gallon
    ch4: 0.42,  // g/US gallon
    n2o: 0.6,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'VIVO - Revvo 90': {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'VIVO - Revvo 92': {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'VIVO - Revvo 95': {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'VIVO - Diesel Primus Plus': {
    fuelType: 'Diesel',
    co2: 10.21, // kg/US gallon
    ch4: 0.42,  // g/US gallon
    n2o: 0.6,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'BP - BP 92': {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'BP - BP Ultimate': {
    fuelType: 'Petrol',
    co2: 8.78, // kg/US gallon
    ch4: 2.74,  // g/US gallon
    n2o: 1.54,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'BP - BP Ultimate Diesel': {
    fuelType: 'Diesel',
    co2: 10.21, // kg/US gallon
    ch4: 0.42,  // g/US gallon
    n2o: 0.6,  // g/US gallon
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  }
};
 
export const refrigerantEmission = {
  'HFC 32-Split': {
    leakage_rate: 0.05,
    gwp: 771
  },
  'HFC 22-Split': {
    leakage_rate: 0.05,
    gwp: 1960
  },
  'HFC 22-Window': {
    leakage_rate: 0.025,
    gwp: 1960
  },
  'HFC 22-Chiller': {
    leakage_rate: 0.1,
    gwp: 1960
  },
  'HFC 134a-Window': {
    leakage_rate: 0.025,
    gwp: 1530
  },
  'R-404a-Chiller': {
    leakage_rate: 0.1,
    gwp: 4728
  },
  'R-410a-Split': {
    leakage_rate: 0.05 ,  
    gwp: 2255
  },
};

export const wwtpEmission ={
  degradOrganicComp: 14.6,
  correctFactor: 1,
  ch4: 0.48,
  fractionPopulation: 0.34,
  degreeUtilization: 0.01,
  nitroinProte: 0.160,
  f_non_com: 1.100,
  find_con: 1.250,
  n2o: 0.005,
  n2o_convert: 1.571,
  ch4_gwp: 27,
  n2o_gwp: 273
};

export const vehicleEmissionFactors = {
  'MOTORCYCLE-Small, ≤125 cc-All fuels': {
    co2: 0.08100,
    ch4: 0.0624,
    n2o: 0.0019,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'Motorcycle-Small, ≤125 cc-All fuels': {
    co2: 0.08100,
    ch4: 0.0624,
    n2o: 0.0019,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'TRUCK TANGKI-3.5 - 7.5 tonnes-Diesel': {
    co2: 0.52448,
    ch4: 0.0040,
    n2o: 0.0200671140939597,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'Truck Tangki-3.5 - 7.5 tonnes-Diesel': {
    co2: 0.52448,
    ch4: 0.0040,
    n2o: 0.0200671140939597,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'BOX TRUCK-3.5 - 7.5 tonnes-Diesel': {
    co2: 0.48019,
    ch4: 0.004,
    n2o: 0.0200671140939597,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'Box Truck-3.5 - 7.5 tonnes-Diesel': {
    co2: 0.48019,
    ch4: 0.004,
    n2o: 0.0200671140939597,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  
  'Cargo Van-Class I, ≤1.305 tonnes-Petrol': {
    co2: 0.18147,
    ch4: 0.0096,
    n2o: 0.00164429530201342,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'CARGO VAN-Class I, ≤1.305 tonnes-Petrol': {
    co2: 0.18147,
    ch4: 0.0096,
    n2o: 0.00164429530201342,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'Trailer STO->33 tonnes-Diesel': {
    co2: 0.90512,
    ch4: 0.0044,
    n2o: 0.0456040268456376,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  
  'MINI VAN-Class III, >1.74 to ≤3.5 tonnes-Petrol': {
    co2: 0.31374,
    ch4: 0.0096,
    n2o: 0.00164429530201342,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  
  'MPV-Medium car, 1.4 - 2.0 litres-Petrol': {
    co2: 0.17751,
    ch4: 0.0128,
    n2o: 0.0012,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'SUV-Medium car, 1.4 - 2.0 litres-Petrol': {
    co2: 0.17751,
    ch4: 0.0128,
    n2o: 0.0012,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  
  'PICKUP-Class II, >1.305 to ≤1.74 tonnes-Petrol': {
    co2: 0.19524,
    ch4: 0.0096,
    n2o: 0.00164429530201342,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'PICKUP TRUCK-Average (up to 3.5 tonnes)-Diesel': {
    co2: 0.22963,
    ch4: 0,
    n2o: 0.00624161073825503,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  
  'Trailer->33 tonnes-Diesel': {
    co2: 1.02996,
    ch4: 0.0052,
    n2o: 0.054261744966443,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
 
  'Trailer-3.5 - 33 tonnes-Diesel': {
    co2: 0.90512,
    ch4: 0.0044,
    n2o: 0.0456040268456376,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },

  'Truck Engkel-7.5 - 17 tonnes-Diesel': {
    co2: 0.6869,
    ch4: 0.0048,
    n2o: 0.0244630872483221,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'Truck Double Engkel->17 tonnes-Diesel': {
    co2: 1.05909,
    ch4: 0.0080,
    n2o: 0.0399664429530201,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'L300 Box-7.5 - 17 tonnes-Diesel': {
    co2: 0.2296,
    ch4: 0,
    n2o: 0.0062,
    co2_gwp: 1,
    ch4_gwp: 27.9,
    n2o_gwp: 273
  },
  'Truck Engkel-Average (up to 3.5 tonnes)-Diesel': {
    co2: 0.6869,
    ch4: 0.0048,
    n2o: 0.0245,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'Trailer STO-3.5 - 33 tonnes-Diesel': {
    co2: 0.90512,
    ch4: 0.0044,
    n2o: 0.0456040268456376,
    co2_gwp: 1, 
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'Pick Up-Class II, >1.305 to ≤1.74 tonnes-Petrol': {
    co2: 0.19524,
    ch4: 0.0096,
    n2o: 0.00164429530201342,
    co2_gwp: 1,
    ch4_gwp: 29.8,
    n2o_gwp: 273
  },
  'L300 Box-Average (up to 3.5 tonnes)-Diesel': {
    co2: 0.22963,
    ch4: 0,
    n2o: 0.0062,
    co2_gwp: 1,
    ch4_gwp: 0,
    n2o_gwp: 273
  },
  'Bus medium 3/4-7.5 - 17 tonnes-Diesel': {
    co2: 0.6869,
    ch4: 0.0048,
    n2o: 0.0244630872483221,
    co2_gwp: 1,
    ch4_gwp: 27.9,
    n2o_gwp: 273
  },
  'Bus Big-7.5 - 17 tonnes-Diesel': {
    co2: 0.6869,
    ch4: 0.0048,
    n2o: 0.0244630872483221,
    co2_gwp: 1,
    ch4_gwp: 27.9,
    n2o_gwp: 273
  }
};

export const purchasedGoodsEmission = {
  'MDF': {
    co2: 0.295,
  },
  'Particle Board': {
    co2: 0.315,
  },
  'Kayu': {
    co2:  0.225,
  },
  'Veener': {
    co2:  0.269,
  },
};

