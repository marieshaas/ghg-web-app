import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import cron from 'node-cron';
import analysisRoutes from './routes/analysis.js';
import predictionRoutes from './routes/prediction.js';
import { refreshAllClusteringCache } from './controller/clustering.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json( {limit:  '50mb'}));
app.use(express.urlencoded( {limit: '50mb', extended: true}));

app.use('/api/predictions', predictionRoutes)

app.use('/api/analysis', analysisRoutes);


export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 60000,
});


const upload = multer({ 
  dest: 'uploads/', 
  limits: {
    fieldSize: 50*1024*1024,
    fields: 20
  }

});

const toNull = (value) => value === undefined ? null : value;

const getTableName = (subcategoryCode) => {
  const mapping = {
    '1.1': 'emissions_stationery_combustion_demo',
    '1.2': 'emissions_mobile_combustion_demo',
    '1.3': 'emissions_wwtp_demo',
    '1.4': 'emissions_refrigerant_demo',
    '2.1': 'emissions_electricity_demo',
    '3.1': 'emissions_transport_demo',
    '3.11': 'emissions_transport_demo',
    '3.2': 'emissions_downstream_transport_demo',
    '3.5': 'emissions_business_travel_demo',
    '4.1': 'emissions_purchased_goods_demo'
  };
  return mapping[subcategoryCode];
};

const parsePeriod = (period, yearFallback) => {
  if (!period) return { year: parseInt(yearFallback) || new Date().getFullYear(), month: 1 };

  const monthMap = {
    jan: 1, januari: 1, january: 1, 
    feb: 2, februari: 2, february: 2,
    mar: 3, maret: 3, march: 3, 
    apr: 4, april: 4,
    may: 5, mei: 5, 
    jun: 6, juni: 6, june: 6,
    jul: 7, juli: 7, july: 7, 
    aug: 8, agustus: 8, august: 8,
    sep: 9, september: 9, sept: 9, 
    oct: 10, oktober: 10, october: 10,
    nov: 11, november: 11, 
    dec: 12, desember: 12, december: 12
  };

  const periodStr = String(period).toLowerCase().trim();
  
  // Split by space or dash
  const parts = periodStr.split(/[\s-]+/);
  
  if (parts.length >= 2) {
    // Format: "Maret 2024" or "Maret-2024"
    const monthName = parts[0];
    const yearStr = parts[1];
    const month = monthMap[monthName];
    
    if (month) {
      let year;
      if (yearStr.length === 2) {
        const twoDigit = parseInt(yearStr);
        year = 2000 + twoDigit;
        const currentYear = new Date().getFullYear();
        if (year > currentYear + 1) {
          year = 1900 + twoDigit;
        }
      } else {
        year = parseInt(yearStr);
      }
      return { year, month };
    }
  }
  
  if (parts.length === 1) {
    const month = monthMap[parts[0]];
    if (month) {
      return { 
        year: parseInt(yearFallback) || new Date().getFullYear(), 
        month 
      };
    }
  }
  console.warn(`Could not parse period: "${period}", using fallback year ${yearFallback}`);
  return { year: parseInt(yearFallback) || new Date().getFullYear(), month: 1 };
};


app.post('/api/emissions/batch', upload.none(), async (req, res) => {
  console.log('=== BATCH SAVE REQUEST ===');

  req.setTimeout(600000);

  
  try {
    const { plant_id, subcategory_id, year, results } = req.body;
    
    if (!results) {
      throw new Error('Results data is missing');
    }
    
    const parsedResults = JSON.parse(results);
    const tableName = getTableName(subcategory_id);
    
    console.log('Saving to table:', tableName);
    console.log('Subcategory:', subcategory_id);
    console.log('Records count:', parsedResults.length);
    
    let successCount = 0;
    const errors = [];

    for (const data of parsedResults) {
      try {
        const { year: dataYear, month: dataMonth } = parsePeriod(data.period, year);
        
        // Use plant from data if available, otherwise fallback to plant_id from form
        // Map sheet name letters to numeric plant IDs (A=1 Plant Bogor, B=2 Plant Majalengka)
        const plantNameToId = { 'A': 1, 'a': 1, 'B': 2, 'b': 2 };
        const rawPlantId = data.plant || plant_id;
        const actualPlantId = plantNameToId[rawPlantId] ?? rawPlantId;

        if (tableName === 'emissions_electricity_demo') {
        await db.execute(`
          INSERT INTO emissions_electricity_demo (plant_id, sub_area, period, year, month, lwbp, wbp, total_kwh, total_mwh, emission_factor, gwp, emission)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          actualPlantId,  
          toNull(data.subArea), 
          toNull(data.period), 
          dataYear, 
          dataMonth, 
          parseFloat(data.lwbp), 
          parseFloat(data.wbp), 
          parseFloat(data.totalKWh), 
          parseFloat(data.totalMWh), 
          parseFloat(data.emissionFactor), 
          parseFloat(data.gwp), 
          parseFloat(data.emission)
        ]);
      } 
        else if (tableName === 'emissions_stationery_combustion_demo') {
        const isTungku = ['tungku', 'incinerator', 'tungku_boiler'].includes(data.subArea);
        const isBoilerGenset = ['genset', 'mini_boiler'].includes(data.subArea);
        
        if (isTungku) {
          const jamKerjaMap = {   
            'A': 14,
            'B': 3,
            'Boiler Besar': 1,
            'Incinerator Maja': 1,
            'Boiler Maja': 1
          };
          const jamKerja = jamKerjaMap[data.factory] || 1;
          const debuPerBulan = data.beratDebuperHari * jamKerja * data.hariKerja; 

          await db.execute(`
            INSERT INTO emissions_stationery_combustion_demo (
              plant_id, subcategory_code, sub_area, period, year, month,
              hari_kerja, factory, berat_debu_per_hari, debu_per_bulan,
              co2_ef, co2_gwp, co2,
              ch4_ef, ch4_gwp, ch4,
              n2o_ef, n2o_gwp, n2o,
              emission
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)  
          `, [
            actualPlantId, subcategory_id, toNull(data.subArea), toNull(data.period),
            dataYear, dataMonth,
            toNull(data.hariKerja), toNull(data.factory),
            parseFloat(data.beratDebuperHari), parseFloat(debuPerBulan),
            parseFloat(data.co2_ef), parseFloat(data.co2_gwp), parseFloat(data.co2),
            parseFloat(data.ch4_ef), parseFloat(data.ch4_gwp), parseFloat(data.ch4),
            parseFloat(data.n2o_ef), parseFloat(data.n2o_gwp), parseFloat(data.n2o),
            parseFloat(data.emission)
          ]);
        } else if (isBoilerGenset) {
          await db.execute(`
            INSERT INTO emissions_stationery_combustion_demo (
              plant_id, subcategory_code, sub_area, period, year, month,
              konsumsi_bbm,
              co2_ef_diesel, co2_ef_bio, co2_gwp, co2,
              ch4_ef_diesel, ch4_ef_bio, ch4_gwp, ch4,
              n2o_ef_diesel, n2o_ef_bio, n2o_gwp, n2o,
              emission
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)  
          `, [
            actualPlantId, subcategory_id, toNull(data.subArea), toNull(data.period),
            dataYear, dataMonth,
            parseFloat(data.bbm),
            parseFloat(data.co2_ef_diesel), parseFloat(data.co2_ef_bio), parseFloat(data.co2_gwp), parseFloat(data.co2),
            parseFloat(data.ch4_ef_diesel), parseFloat(data.ch4_ef_bio), parseFloat(data.ch4_gwp), parseFloat(data.ch4),
            parseFloat(data.n2o_ef_diesel), parseFloat(data.n2o_ef_bio), parseFloat(data.n2o_gwp), parseFloat(data.n2o),
            parseFloat(data.emission)
          ]);
        }
      }
        else if (tableName === 'emissions_mobile_combustion_demo') {
          await db.execute(`
            INSERT INTO emissions_mobile_combustion_demo (
              plant_id, subcategory_code, sub_area, period, year, month,
              fuel_type, consume_bbm, total_litre,
              co2_ef_fossil, co2_ef_bio, co2_gwp,
              ch4_ef_fossil, ch4_gwp,
              n2o_ef_fossil, n2o_gwp,
              co2_fossil, co2_bio, co2,
              ch4, n2o,
              total_emission
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)  
          `, [
            actualPlantId,
            subcategory_id,
            toNull(data.subArea),
            toNull(data.period),
            dataYear,
            dataMonth,
            // Data Input - forklift atau vehicle
            toNull(data.fuel_type),           
            parseFloat(data.consume_bbm),         
            parseFloat(data.totalLitre),         
            // EF
            parseFloat(data.co2_ef_fossil || data.co2_ef),  
            parseFloat(data.co2_ef_bio),          
            parseFloat(data.co2_gwp),
            parseFloat(data.ch4_ef_fossil || data.ch4_ef),  
            parseFloat(data.ch4_gwp),
            parseFloat(data.n2o_ef_fossil || data.n2o_ef),  
            parseFloat(data.n2o_gwp),
            // Emisi
            parseFloat(data.co2_fossil),          
            parseFloat(data.co2_bio),             
            parseFloat(data.co2),                 
            parseFloat(data.ch4),                 
            parseFloat(data.n2o),                 
            parseFloat(data.emission)
          ]);
        }
        else if (tableName === 'emissions_transport_demo') {
          await db.execute(`
            INSERT INTO emissions_transport_demo (
              plant_id, subcategory_code, period, year, month, 
              supplier, vehicle_type, size, fuel, 
              distance, quantity, total_distance, 
              co2_ef, co2_gwp, co2, 
              ch4_ef, ch4_gwp, ch4, 
              n2o_ef, n2o_gwp, n2o, 
              emission
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            actualPlantId,  
            subcategory_id, 
            toNull(data.period), 
            dataYear, 
            dataMonth, 
            toNull(data.supplier),
            toNull(data.vehicleType),
            toNull(data.size), 
            toNull(data.fuel), 
            parseFloat(data.distance), 
            toNull(data.quantity) ? parseInt(data.quantity) : null, 
            parseFloat(data.totalDistance), 
            parseFloat(data.co2_ef), 
            parseFloat(data.co2_gwp), 
            parseFloat(data.co2), 
            parseFloat(data.ch4_ef), 
            parseFloat(data.ch4_gwp), 
            parseFloat(data.ch4), 
            parseFloat(data.n2o_ef), 
            parseFloat(data.n2o_gwp), 
            parseFloat(data.n2o), 
            parseFloat(data.emission)
          ]);
        }
        else if (tableName === 'emissions_business_travel_demo') {
          await db.execute(`
            INSERT INTO emissions_business_travel_demo (
              plant_id, period, year, month, 
              route, vehicle_type, size, fuel, distance, 
              co2_ef, co2_gwp, co2, 
              ch4_ef, ch4_gwp, ch4, 
              n2o_ef, n2o_gwp, n2o, 
              emission
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            actualPlantId,  
            toNull(data.period), 
            dataYear, 
            dataMonth, 
            toNull(data.route), 
            toNull(data.vehicleType), 
            toNull(data.size), 
            toNull(data.fuel), 
            parseFloat(data.distance), 
            parseFloat(data.co2_ef), 
            parseFloat(data.co2_gwp), 
            parseFloat(data.co2), 
            parseFloat(data.ch4_ef), 
            parseFloat(data.ch4_gwp), 
            parseFloat(data.ch4), 
            parseFloat(data.n2o_ef), 
            parseFloat(data.n2o_gwp), 
            parseFloat(data.n2o), 
            parseFloat(data.emission)
          ]);
        }

        else if (tableName === 'emissions_downstream_transport_demo') {
          await db.execute(`
          INSERT INTO emissions_downstream_transport_demo (
            plant_id, subcategory_code, period, year, month,
            route, vehicle_type, size, fuel, quantity, distance,
            co2_ef, co2_gwp, co2,
            ch4_ef, ch4_gwp, ch4,
            n2o_ef, n2o_gwp, n2o,
            emission
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          actualPlantId, subcategory_id, toNull(data.period), dataYear, dataMonth,
          toNull(data.route), toNull(data.vehicleType), toNull(data.size), toNull(data.fuel),
          toNull(data.quantity), parseFloat(data.distance),
          parseFloat(data.co2_ef), parseFloat(data.co2_gwp), parseFloat(data.co2),
          parseFloat(data.ch4_ef), parseFloat(data.ch4_gwp), parseFloat(data.ch4),
          parseFloat(data.n2o_ef), parseFloat(data.n2o_gwp), parseFloat(data.n2o),
          parseFloat(data.emission)
        ]);
      }

        else if (tableName === 'emissions_purchased_goods_demo') {
          await db.execute(`
            INSERT INTO emissions_purchased_goods_demo (
              plant_id, subcategory_code, period, year, month,
              material_type, qty,
              co2_ef, co2_gwp, total_emisi_mg_c, faktor_konversi, mg_co2_emission,
              emission
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            actualPlantId, 
            subcategory_id, 
            toNull(data.period), 
            dataYear, 
            dataMonth,
            toNull(data.materialType), 
            parseFloat(data.qty),
            parseFloat(data.co2_ef), 
            parseFloat(data.co2_gwp || 1),
            parseFloat(data.total_emisi_mg_c), 
            parseFloat(data.faktor_konversi || 3.6667),
            parseFloat(data.mg_co2_emission),
            parseFloat(data.emission)
          ]);
        }
        else if (tableName === 'emissions_wwtp_demo') {
        await db.execute(`
          INSERT INTO emissions_wwtp_demo (plant_id, subcategory_code, sub_area, period, year, month, population, 
          protein_consum_per_capita, organic_degrad_material, sludge_removed, methane_recovered, ch4_ef, ch4_gwp, ch4,
          n2o_ef, n2o_gwp, n2o, total_emission)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          actualPlantId,  
          '1.3',
          toNull(data.subArea), 
          toNull(data.period), 
          dataYear, 
          dataMonth, 
          parseFloat(data.population), 
          parseFloat(data.proteinConsumperCapita), 
          parseFloat(data.organicDegradMaterial), 
          parseFloat(data.sludgeRemoved ), 
          parseFloat(data.methaneRecovered), 
          parseFloat(data.ch4_ef), 
          parseFloat(data.ch4_gwp), 
          parseFloat(data.ch4), 
          parseFloat(data.n2o_ef), 
          parseFloat(data.n2o_gwp), 
          parseFloat(data.n2o), 
          parseFloat(data.emission)
        ]);
      } 
        else if (tableName === 'emissions_refrigerant_demo') {
        await db.execute(`
          INSERT INTO emissions_refrigerant_demo (plant_id, subcategory_code, sub_area, period, year, month, location, 
          freon_type, refrigerant_type, quantity, capacity_gram, capacity_kg, leakage_rate, gwp,
          emission)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          actualPlantId,  
          '1.4',
          toNull(data.subArea), 
          toNull(data.period), 
          dataYear, 
          dataMonth, 
          toNull(data.location),              
          toNull(data.freonType),             
          toNull(data.refrigerantType),       
          toNull(data.qty),                   
          parseFloat(data.capacity),              
          parseFloat(data.capacity_kg), 
          parseFloat(data.leakage_rate), 
          parseFloat(data.gwp), 
          parseFloat(data.emission)
        ]);
      } 
        else {
          await db.execute(`
            INSERT INTO emissions_generic (plant_id, subcategory_code, period, year, month, data, unit, emission_factor, emission)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            actualPlantId,  // Changed
            subcategory_id, 
            toNull(data.period), 
            dataYear, 
            dataMonth, 
            parseFloat(data.data), 
            toNull(data.unit) || 'unit', 
            parseFloat(data.emissionFactor), 
            parseFloat(data.emission)
          ]);
        }

        successCount++;
      } catch (err) {
        console.error('❌ Error saving record:', err);
        console.error('Data that failed:', JSON.stringify(data, null, 2));
        errors.push({ period: data.period, error: err.message });
      }
    }

    res.json({ 
      success: true, 
      message: `Saved ${successCount} of ${parsedResults.length} records`,
      successCount,
      totalCount: parsedResults.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Batch save error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ADD THIS - Summary route for dashboard
app.get('/api/emissions/summary', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const [plantSummary] = await db.execute(`
      SELECT
        p.id as plant_id,
        p.name as plant_name,
        all_emissions.year,
        all_emissions.month as month_num,
        CAST(SUM(all_emissions.total_emission) AS DECIMAL(15,4)) as total_emission
      FROM (
        SELECT plant_id, year, month, emission as total_emission FROM emissions_stationery_combustion_demo
        UNION ALL
        SELECT plant_id, year, month, total_emission FROM emissions_mobile_combustion_demo
        UNION ALL
        SELECT plant_id, year, month, total_emission FROM emissions_wwtp_demo
        UNION ALL
        SELECT plant_id, year, month, emission as total_emission FROM emissions_refrigerant_demo
        UNION ALL
        SELECT plant_id, year, month, emission as total_emission FROM emissions_electricity_demo
        UNION ALL
        SELECT plant_id, year, month, emission as total_emission FROM emissions_downstream_transport_demo
        UNION ALL 
        SELECT plant_id, year, month, emission as total_emission FROM emissions_purchased_goods_demo
        UNION ALL 
        SELECT plant_id, year, month, emission as total_emission FROM emissions_transport_demo
        UNION ALL 
        SELECT plant_id, year, month, emission as total_emission FROM emissions_business_travel_demo
        UNION ALL
        SELECT plant_id, year, month, emission as total_emission FROM emissions_generic
      ) as all_emissions
      JOIN plants p ON all_emissions.plant_id = p.id
      WHERE all_emissions.year <= ?
      GROUP BY p.id, p.name, all_emissions.year, all_emissions.month
      ORDER BY all_emissions.year DESC, all_emissions.month DESC
    `, [currentYear]);// Tambahkan setelah query plantSummary
      
    const [category12Summary] = await db.execute(`
        SELECT 
          year,
          sub_area,
          SUM(total_emission) as total_emission
        FROM emissions_mobile_combustion_demo
        GROUP BY year, sub_area
        ORDER BY year DESC, sub_area
      `);


    const [categorySummary] = await db.execute(`
      SELECT 
        c.code,
        c.name,
        cat_emissions.year,
        CAST(SUM(cat_emissions.total_emission) AS DECIMAL(15,4)) as total_emission
      FROM (
        SELECT 1 as cat_id, year, emission as total_emission FROM emissions_stationery_combustion_demo
        UNION ALL
        SELECT 1 as cat_id, year, total_emission FROM emissions_mobile_combustion_demo
        UNION ALL
        SELECT 1 as cat_id, year, total_emission FROM emissions_wwtp_demo
        UNION ALL
        SELECT 1 as cat_id, year, emission as total_emission FROM emissions_refrigerant_demo
        UNION ALL
        SELECT 2 as cat_id, year, emission as total_emission FROM emissions_electricity_demo
        UNION ALL
        SELECT 3 as cat_id, year, emission as total_emission FROM emissions_transport_demo
        UNION ALL
        SELECT 3 as cat_id, year, emission as total_emission FROM emissions_downstream_transport_demo
        UNION ALL
        SELECT 3 as cat_id, year, emission as total_emission FROM emissions_business_travel_demo
        UNION ALL
        SELECT 4 as cat_id, year, emission as total_emission FROM emissions_purchased_goods_demo
      ) as cat_emissions
      JOIN categories c ON cat_emissions.cat_id = c.id
      WHERE cat_emissions.year <= ?
      GROUP BY c.id, c.code, c.name, cat_emissions.year
    `, [currentYear]);

    const cleanedPlantSummary = plantSummary.map(row => ({
      ...row,
      total_emission: parseFloat(row.total_emission)
    }));

    const cleanedCategorySummary = categorySummary.map(row => ({
      ...row,
      total_emission: parseFloat(row.total_emission)
    }));

    res.json({ 
      plantSummary: cleanedPlantSummary, 
      categorySummary: cleanedCategorySummary,
      category12Summary,
      lastUpdated: new Date().toISOString() 
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// RENAME THIS to /api/emissions (existing route)
app.get('/api/emissions', async (req, res) => {
  try {
    const { plant_id, subcategory_id, year, month } = req.query;
    
    if (!plant_id) {
      return res.status(400).json({ error: 'plant_id is required' });
    }

    if (!subcategory_id) {
      const [allResults] = await db.execute(`
        SELECT 'stationery_combustion_demo' as type, id, plant_id, period, year, month, emission, '1.1' as subcategory_code
        FROM emissions_stationery_combustion_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'mobile_combustion_demo' as type, id, plant_id, period, year, month, total_emission, '1.2' as subcategory_code
        FROM emissions_mobile_combustion_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'wwtp_demo' as type, id, plant_id, period, year, month, total_emission, '1.3' as subcategory_code
        FROM emissions_wwtp_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'refrigerant_demo' as type, id, plant_id, period, year, month, emission, '1.4' as subcategory_code
        FROM emissions_refrigerant_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'electricity_demo' as type, id, plant_id, period, year, month, emission, '2.1' as subcategory_code
        FROM emissions_electricity_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'transport_demo' as type, id, plant_id, period, year, month, emission, subcategory_code
        FROM emissions_transport_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'downstream_transport_demo' as type, id, plant_id, period, year, month, emission, '3.2' as subcategory_code
        FROM emissions_downstream_transport_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'business_travel_demo' as type, id, plant_id, period, year, month, emission, '3.5' as subcategory_code
        FROM emissions_business_travel_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'purchased_goods_demo' as type, id, plant_id, period, year, month, emission, '4.1' as subcategory_code
        FROM emissions_purchased_goods_demo WHERE plant_id = ?
        UNION ALL
        SELECT 'generic' as type, id, plant_id, period, year, month, emission, subcategory_code
        FROM emissions_generic WHERE plant_id = ?
        ORDER BY year DESC, month DESC
      `, [plant_id, plant_id, plant_id, plant_id]);
      
      return res.json(allResults);
    }

    const tableName = getTableName(subcategory_id);
    let query = `SELECT * FROM ${tableName} WHERE plant_id = ?`;
    const params = [plant_id];
    
    if (['emissions_transport_demo', 'emissions_generic'].includes(tableName)) {
      query += ' AND subcategory_code = ?';
      params.push(subcategory_id);
    }
    if (year) { query += ' AND year = ?'; params.push(year); }
    if (month) { query += ' AND month = ?'; params.push(month); }
    query += ' ORDER BY year DESC, month DESC';
    
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error fetching emissions:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/emissions/available-years', async (req, res) => {
  try{
    const [years] = await db.execute(`
      SELECT DISTINCT year
      FROM (
        SELECT year FROM emissions_stationery_combustion_demo
        UNION
        SELECT year FROM emissions_mobile_combustion_demo
        UNION
        SELECT year FROM emissions_wwtp_demo
        UNION
        SELECT year FROM emissions_refrigerant_demo
        UNION
        SELECT year FROM emissions_electricity_demo
        UNION
        SELECT year FROM emissions_transport_demo
        UNION
        SELECT year FROM emissions_downstream_transport_demo
        UNION
        SELECT year FROM emissions_business_travel_demo
        UNION
        SELECT year FROM emissions_purchased_goods_demo
        UNION
        SELECT year FROM emissions_generic
      ) as all_years
      WHERE year IS NOT NULL
      ORDER BY year DESC 
      `);

      res.json({years: years.map(y => y.year)});
  }  catch (error) {
    console.error('Error fetching available years:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/emissions/monthly-report', async (req, res) => {
  try {
    const { plant_id, category_id, month, year } = req.query;
    
    console.log('Monthly Report Request:', { plant_id, category_id, month, year });

    let whereClauses = [];
    let params = [];

    if (plant_id) {
      whereClauses.push('all_emissions.plant_id = ?');
      params.push(plant_id);
    }

    if (category_id) {
      whereClauses.push('c.id = ?');
      params.push(parseInt(category_id));
    }

    if (month) {
      whereClauses.push('all_emissions.month = ?');
      params.push(parseInt(month));
    }
    if (year) {
      whereClauses.push('all_emissions.year = ?');
      params.push(parseInt(year));
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [reportData] = await db.execute(`
      SELECT
        CASE p.id WHEN 1 THEN 'Plant A' WHEN 2 THEN 'Plant B' ELSE p.name END as plant_name,
        c.code as category_code,
        c.name as category_name,
        all_emissions.subcategory_code,
        all_emissions.sub_area,
        all_emissions.year,
        all_emissions.month,
        all_emissions.period,
        SUM(all_emissions.emission) as total_emission,
        COUNT(*) as record_count
      FROM (
        SELECT 
          plant_id, 
          '1.1' as subcategory_code,
          sub_area,
          year, 
          month,
          period,
          emission 
        FROM emissions_stationery_combustion_demo

        UNION ALL

        SELECT 
          plant_id, 
          '1.2' as subcategory_code,
          sub_area,
          year, 
          month,
          period,
         total_emission as emission 
        FROM emissions_mobile_combustion_demo
        
        UNION ALL
        SELECT 
          plant_id, 
          '1.3' as subcategory_code,
          sub_area,
          year, 
          month,
          period,
         total_emission as emission 
        FROM emissions_wwtp_demo
        
        UNION ALL
        SELECT 
          plant_id, 
          '1.4' as subcategory_code,
          sub_area,
          year, 
          month,
          period,
         emission 
        FROM emissions_refrigerant_demo
        
        UNION ALL
        SELECT 
          plant_id, 
          '2.1' as subcategory_code,
          sub_area,
          year, 
          month,
          period,
          emission 
        FROM emissions_electricity_demo
        
        UNION ALL
        
        SELECT 
          plant_id, 
          subcategory_code,
          NULL as sub_area,
          year, 
          month,
          period,
          emission 
        FROM emissions_transport_demo
        
        UNION ALL
        
        SELECT 
          plant_id, 
          '3.2' as subcategory_code,
          NULL as sub_area,
          year, 
          month,
          period,
          emission 
        FROM emissions_downstream_transport_demo
        
        UNION ALL

        SELECT 
          plant_id, 
          '3.5' as subcategory_code,
          NULL as sub_area,
          year, 
          month,
          period,
          emission 
        FROM emissions_business_travel_demo
        
        UNION ALL
        
        SELECT 
          plant_id, 
          '4.1' as subcategory_code,
          NULL as sub_area,
          year, 
          month,
          period,
          emission 
        FROM emissions_purchased_goods_demo
        
        UNION ALL

        SELECT 
          plant_id, 
          subcategory_code,
          NULL as sub_area,
          year, 
          month,
          period,
          emission 
        FROM emissions_generic
      ) as all_emissions
      JOIN plants p ON all_emissions.plant_id = p.id
      JOIN categories c ON (
        (all_emissions.subcategory_code LIKE '1.%' AND c.id = 1) OR
        (all_emissions.subcategory_code LIKE '2.%' AND c.id = 2) OR
        (all_emissions.subcategory_code LIKE '3.%' AND c.id = 3) OR
        (all_emissions.subcategory_code LIKE '4.%' AND c.id = 4)
      )
      ${whereSQL}
      GROUP BY 
        p.id, p.name, 
        c.id, c.code, c.name,
        all_emissions.subcategory_code,
        all_emissions.sub_area,
        all_emissions.year,
        all_emissions.month,
        all_emissions.period
      ORDER BY 
        all_emissions.year DESC,
        all_emissions.month ASC,
        p.name ASC,
        c.code ASC,
        all_emissions.subcategory_code ASC,
        all_emissions.sub_area ASC
    `, params);

    // Calculate summary
    const totalEmissions = reportData.reduce((sum, row) => sum + parseFloat(row.total_emission || 0), 0);
    const totalRecords = reportData.reduce((sum, row) => sum + parseInt(row.record_count || 0), 0);

    res.json({ 
      data: reportData.map(row => ({
        ...row,
        total_emission: parseFloat(row.total_emission)
      })),
      summary: {
        totalEmissions,
        totalRecords,
        plantCount: [...new Set(reportData.map(r => r.plant_name))].length,
        categoryCount: [...new Set(reportData.map(r => r.category_code))].length
      },
      filters: { plant_id, category_id, month, year }
    });

  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/emissions/check-duplicate', async (req, res) => {
  try {
    const { plant_id, subcategory_id, year, month } = req.query;

    if (!plant_id || !subcategory_id || !year || !month) {
      return res.status(400).json({ error: 'plant_id, subcategory_id, year, and month are required' });
    }

    const tableName = getTableName(subcategory_id);
    if (!tableName) {
      return res.status(400).json({ error: `Unknown subcategory_id: ${subcategory_id}` });
    }

    const plantNameToId = { 'A': 1, 'a': 1, 'B': 2, 'b': 2 };
    const resolvedPlantId = plantNameToId[plant_id] ?? parseInt(plant_id);

    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM ${tableName} WHERE plant_id = ? AND year = ? AND month = ?`,
      [resolvedPlantId, parseInt(year), parseInt(month)]
    );
    res.json({ exists: rows[0].count > 0 });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));

// Retrain ML model on the 1st of every month at 00:00 midnight
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
cron.schedule('0 0 1 * *', async () => {
  console.log('[cron] Triggering monthly model retrain...');
  try {
    const res = await fetch(`${ML_SERVICE_URL}/retrain`, { method: 'POST' });
    const data = await res.json();
    console.log('[cron] Retrain response:', data.message);
  } catch (err) {
    console.error('[cron] Failed to trigger retrain:', err.message);
  }
}, { timezone: 'Asia/Jakarta' });

// Refresh clustering cache setiap 3 bulan (1 Jan, 1 Apr, 1 Jul, 1 Okt jam 01:00)
cron.schedule('0 1 1 1,4,7,10 *', async () => {
  console.log('[cron] Triggering quarterly clustering cache refresh...');
  try {
    await refreshAllClusteringCache();
  } catch (err) {
    console.error('[cron] Quarterly clustering refresh failed:', err.message);
  }
}, { timezone: 'Asia/Jakarta' });

// Pre-warm clustering cache saat server pertama kali start (background, non-blocking)
setImmediate(() => {
  refreshAllClusteringCache().catch(err =>
    console.error('[startup] Clustering cache pre-warm failed:', err.message)
  );
});