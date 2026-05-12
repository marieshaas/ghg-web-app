/**
 * Demo-mode fallback data.
 * Digunakan otomatis ketika backend tidak dapat dijangkau (API down / deploy frontend only).
 */

const DEMO_YEAR = 2025;
const DEMO_YEAR_PREV = 2024;

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

// ─── Dashboard ───────────────────────────────────────────────────────────────

const plantATrend2025 = [1350, 1280, 1320, 1180, 1290, 1220, 1310, 1180, 1250, 1320, 1280, 1200];
const plantBTrend2025 = [980,  920,  960,  870,  940,  890,  950,  870,  920,  960,  930,  870];
const plantATrend2024 = [1200, 1150, 1280, 1100, 1180, 1150, 1220, 1100, 1190, 1250, 1210, 1130];
const plantBTrend2024 = [880,  840,  890,  800,  860,  820,  870,  800,  840,  880,  850,  810];

const totalCurrent  = sum(plantATrend2025) + sum(plantBTrend2025); // 26040
const totalPrevious = sum(plantATrend2024) + sum(plantBTrend2024); // 24100

export const DUMMY_DASHBOARD = {
  isEmpty: false,
  isDemoMode: true,
  years: { current: DEMO_YEAR, previous: DEMO_YEAR_PREV },
  grandTotal: {
    current: totalCurrent,
    previous: totalPrevious,
    yoyChange: ((totalCurrent - totalPrevious) / totalPrevious) * 100,
  },
  categories: {
    '1': { code: '1', name: 'Direct Emissions',                              current: 5200,  previous: 4900,  yoyChange: 6.12  },
    '2': { code: '2', name: 'Indirect Emissions',                            current: 12800, previous: 12100, yoyChange: 5.79  },
    '3': { code: '3', name: 'Other Indirect Emissions (Transportation)',      current: 6200,  previous: 5600,  yoyChange: 10.71 },
    '4': { code: '4', name: 'Other Indirect Emissions (Product/Material)',    current: 1840,  previous: 1500,  yoyChange: 22.67 },
  },
  highestCategory: { code: '2', name: 'Indirect Emissions', current: 12800, previous: 12100, yoyChange: 5.79 },
  plantData: {
    current:  { a: { trend: plantATrend2025, total: sum(plantATrend2025) }, b: { trend: plantBTrend2025, total: sum(plantBTrend2025) } },
    previous: { a: { trend: plantATrend2024, total: sum(plantATrend2024) }, b: { trend: plantBTrend2024, total: sum(plantBTrend2024) } },
  },
  category12: {
    forklift: { current: 1800, previous: 1650 },
    vehicle:  { current: 1200, previous: 1050 },
    total:    { current: 3000, previous: 2700, yoyChange: 11.11 },
  },
  currentMonth: 11,
  nextMonthPrediction: 2150,
  lastUpdated: new Date().toISOString(),
  missingCategories: [],
  currentMonthName: 'December',
};

// ─── Monthly Report ──────────────────────────────────────────────────────────

const MONTH_NAMES_ID = ['Januari','Februari','Maret','April','Mei','Juni',
                        'Juli','Agustus','September','Oktober','November','Desember'];

const SUBCAT_META = {
  '1.1': { catCode: '1', catName: 'Direct Emissions' },
  '1.2': { catCode: '1', catName: 'Direct Emissions' },
  '2.1': { catCode: '2', catName: 'Indirect Emissions' },
  '3.1': { catCode: '3', catName: 'Other Indirect Emissions (Transportation)' },
  '3.5': { catCode: '3', catName: 'Other Indirect Emissions (Transportation)' },
  '4.1': { catCode: '4', catName: 'Other Indirect Emissions (Product/Material)' },
};

// Base emissions per subcategory per month (tCO2e)
const BASE = {
  'Plant A': { '1.1': 180, '1.2': 130, '2.1': 600, '3.1': 180, '3.5': 30, '4.1': 80 },
  'Plant B': { '1.1': 120, '1.2': 90,  '2.1': 420, '3.1': 140, '3.5': 20, '4.1': 60 },
};

function buildMonthlyRows() {
  const rows = [];
  for (const year of [DEMO_YEAR, DEMO_YEAR_PREV]) {
    for (let month = 1; month <= 12; month++) {
      for (const plant of ['Plant A', 'Plant B']) {
        for (const subcat of Object.keys(BASE[plant])) {
          const factor = 0.85 + Math.abs(Math.sin(month * 0.9 + subcat.charCodeAt(0) * 0.3)) * 0.3;
          const emission = parseFloat((BASE[plant][subcat] * factor).toFixed(2));
          const meta = SUBCAT_META[subcat];
          rows.push({
            plant_name:       plant,
            category_code:    meta.catCode,
            category_name:    meta.catName,
            subcategory_code: subcat,
            sub_area:         null,
            year,
            month,
            period:           `${MONTH_NAMES_ID[month - 1]} ${year}`,
            total_emission:   emission,
            record_count:     3 + Math.floor(Math.abs(Math.sin(month + subcat.charCodeAt(0))) * 5),
          });
        }
      }
    }
  }
  return rows;
}

export const DUMMY_MONTHLY_ROWS   = buildMonthlyRows();
export const DUMMY_AVAILABLE_YEARS = [DEMO_YEAR, DEMO_YEAR_PREV];

export function buildDummyMonthlySummary(rows) {
  return {
    totalEmissions: rows.reduce((s, r) => s + parseFloat(r.total_emission || 0), 0),
    totalRecords:   rows.reduce((s, r) => s + parseInt(r.record_count || 0), 0),
    plantCount:     [...new Set(rows.map(r => r.plant_name))].length,
    categoryCount:  [...new Set(rows.map(r => r.category_code))].length,
  };
}

// ─── Emission Analysis ───────────────────────────────────────────────────────

export const DUMMY_CATEGORY_RANKING = [
  { category_code: '2.1', category_name: 'Purchased Electricity',    total_emission: 12100, percentage: '50.2' },
  { category_code: '1.1', category_name: 'Stationary Combustion',    total_emission: 4900,  percentage: '20.3' },
  { category_code: '3.1', category_name: 'Upstream Transportation',  total_emission: 3200,  percentage: '13.3' },
  { category_code: '1.2', category_name: 'Mobile Combustion',        total_emission: 1800,  percentage: '7.5'  },
  { category_code: '4.1', category_name: 'Purchased Goods',          total_emission: 1500,  percentage: '6.2'  },
  { category_code: '3.5', category_name: 'Business Travel',          total_emission: 550,   percentage: '2.3'  },
  { category_code: '1.3', category_name: 'Fugitive Emissions (WWTP)',total_emission: 50,    percentage: '0.2'  },
];

export const DUMMY_CONSUMPTION = {
  '2.1': [
    { sub_area: 'Plant A - Main Production', total_emission: 7200, total_kwh: 9000000 },
    { sub_area: 'Plant A - Utility',         total_emission: 2000, total_kwh: 2500000 },
    { sub_area: 'Plant B - Main Production', total_emission: 2100, total_kwh: 2625000 },
    { sub_area: 'Plant B - Utility',         total_emission: 800,  total_kwh: 1000000 },
  ],
  '1.1': [
    { sub_area: 'tungku',     factory: 'A', total_emission: 2800, total_debu: 84000  },
    { sub_area: 'mini_boiler',factory: 'A', total_emission: 1200, total_fuel: 450000 },
    { sub_area: 'tungku',     factory: 'B', total_emission: 650,  total_debu: 19500  },
    { sub_area: 'genset',     factory: 'B', total_emission: 250,  total_fuel: 93750  },
  ],
  '3.1': [
    { sub_area: 'PT Maju Logistik',     total_emission: 980 },
    { sub_area: 'CV Cepat Transport',   total_emission: 760 },
    { sub_area: 'PT Nusantara Cargo',   total_emission: 640 },
    { sub_area: 'PT Logindo',           total_emission: 520 },
    { sub_area: 'CV Abadi Jaya',        total_emission: 300 },
  ],
  '1.2': [
    { sub_area: 'forklift', fuel_type: 'Solar', total_emission: 1050, total_fuel: 393750 },
    { sub_area: 'vehicle',  fuel_type: 'Solar', total_emission: 750,  total_fuel: 281250 },
  ],
  '4.1': [
    { sub_area: 'Plastic Packaging', total_emission: 620 },
    { sub_area: 'Cardboard',         total_emission: 480 },
    { sub_area: 'Glass',             total_emission: 280 },
    { sub_area: 'Metal Cans',        total_emission: 120 },
  ],
  '3.5': [
    { sub_area: 'Jakarta - Bogor',     total_emission: 250 },
    { sub_area: 'Bogor - Majalengka',  total_emission: 180 },
    { sub_area: 'Domestic Flights',    total_emission: 120 },
  ],
  '1.3': [
    { sub_area: 'wwtp', total_emission: 50 },
  ],
};

export const DUMMY_RECOMMENDATIONS = {
  '2.1': [
    { title: 'Install Solar Panels',       description: 'Rooftop solar panels can reduce purchased electricity dependency by up to 30%.', priority: 1, impact: 'High',   cost: 'High'   },
    { title: 'LED Lighting Upgrade',       description: 'Replace all fluorescent lighting with LED to cut electricity consumption by 15%.', priority: 2, impact: 'Medium', cost: 'Low'    },
    { title: 'Energy Management System',   description: 'IoT-based EMS to monitor and optimize real-time energy usage.', priority: 2, impact: 'Medium', cost: 'Medium' },
  ],
  '1.1': [
    { title: 'Biomass Fuel Switching',     description: 'Switch from diesel to certified biomass fuel for furnace operations.', priority: 1, impact: 'High',   cost: 'Medium' },
    { title: 'Combustion Efficiency',      description: 'Regular maintenance and tuning of combustion equipment to improve efficiency by 10%.', priority: 2, impact: 'Medium', cost: 'Low' },
  ],
  '3.1': [
    { title: 'Supplier Consolidation',     description: 'Consolidate deliveries to reduce total number of trips and transport emissions.', priority: 1, impact: 'High',   cost: 'Low'    },
    { title: 'EV Fleet Transition',        description: 'Prioritize suppliers with electric or hybrid vehicles for short-distance routes.', priority: 2, impact: 'Medium', cost: 'Medium' },
  ],
  default: [
    { title: 'Continuous Monitoring',      description: 'Implement continuous monitoring to identify reduction opportunities.', priority: 1, impact: 'Medium', cost: 'Low' },
    { title: 'Staff Training',             description: 'Train staff on emission reduction best practices for this category.',  priority: 2, impact: 'Low',    cost: 'Low' },
  ],
};

export function getDummyRecommendations(categoryCode) {
  return DUMMY_RECOMMENDATIONS[categoryCode] || DUMMY_RECOMMENDATIONS.default;
}

export function getDummyConsumption(categoryCode) {
  return DUMMY_CONSUMPTION[categoryCode] || [];
}

// ─── Supplier Clustering ──────────────────────────────────────────────────────

export const DUMMY_SUPPLIER_CLUSTERING = {
  computed_at: new Date().toISOString(),
  suppliers: [
    { supplier: 'PT Maju Logistik',      plant_id: 1, cluster: 0, frequency: 48, total_emission: 980.32 },
    { supplier: 'CV Cepat Transport',    plant_id: 1, cluster: 0, frequency: 42, total_emission: 760.18 },
    { supplier: 'PT Nusantara Cargo',    plant_id: 2, cluster: 1, frequency: 28, total_emission: 640.55 },
    { supplier: 'PT Logindo',            plant_id: 1, cluster: 1, frequency: 22, total_emission: 520.40 },
    { supplier: 'CV Abadi Jaya',         plant_id: 2, cluster: 1, frequency: 18, total_emission: 300.22 },
    { supplier: 'PT Sinar Mas Transport',plant_id: 1, cluster: 2, frequency: 10, total_emission: 180.75 },
    { supplier: 'CV Delta Ekspres',      plant_id: 2, cluster: 2, frequency: 8,  total_emission: 140.30 },
    { supplier: 'PT Wahana Logistik',    plant_id: 1, cluster: 2, frequency: 6,  total_emission: 110.20 },
    { supplier: 'CV Jaya Mandiri',       plant_id: 2, cluster: 2, frequency: 5,  total_emission: 88.60  },
    { supplier: 'PT Kilat Express',      plant_id: 1, cluster: 2, frequency: 4,  total_emission: 72.40  },
  ],
  clusters: [
    { cluster: 0, intensity: 'High Intensity',   supplier_count: 2, total_emission: 1740.50, emission_per_transaction: 19.34, avg_frequency: 45.0,  avg_emission: 870.25 },
    { cluster: 1, intensity: 'Medium Intensity', supplier_count: 3, total_emission: 1461.17, emission_per_transaction: 21.49, avg_frequency: 22.67, avg_emission: 487.06 },
    { cluster: 2, intensity: 'Low Intensity',    supplier_count: 5, total_emission:  592.25, emission_per_transaction: 17.42, avg_frequency: 6.6,   avg_emission: 118.45 },
  ],
};

export const DUMMY_SUPPLIER_PREDICTIONS = {
  success: true,
  next_month: 'Juni 2026',
  suppliers: [
    { supplier: 'PT Maju Logistik',       plant_id: 1, predicted_emission: 85.2341 },
    { supplier: 'CV Cepat Transport',     plant_id: 1, predicted_emission: 68.7823 },
    { supplier: 'PT Nusantara Cargo',     plant_id: 2, predicted_emission: 57.4412 },
    { supplier: 'PT Logindo',             plant_id: 1, predicted_emission: 46.8901 },
    { supplier: 'CV Abadi Jaya',          plant_id: 2, predicted_emission: 28.3320 },
    { supplier: 'PT Sinar Mas Transport', plant_id: 1, predicted_emission: 16.2150 },
    { supplier: 'CV Delta Ekspres',       plant_id: 2, predicted_emission: 13.4521 },
    { supplier: 'PT Wahana Logistik',     plant_id: 1, predicted_emission: 10.8800 },
    { supplier: 'CV Jaya Mandiri',        plant_id: 2, predicted_emission:  8.3210 },
    { supplier: 'PT Kilat Express',       plant_id: 1, predicted_emission:  6.9540 },
  ],
};
