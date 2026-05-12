import express from 'express';
import { db } from '../server.js';
import getSupplierClustering from '../controller/clustering.js';

const router = express.Router();

// Category ranking analysis - COMPLETE WITH ALL TABLES
router.get('/category-ranking', async (req, res) => {
  try {
    const { year, plant_id } = req.query;
    console.log('📊 Analysis request:', { year, plant_id });

    const plantFilter = plant_id ? 'AND plant_id = ?' : '';
    const baseParams = [year];
    if (plant_id) baseParams.push(plant_id);
    
    const query = `
      SELECT 
        category_code,
        category_name,
        SUM(total_emission) as total_emission,
        COUNT(*) as record_count,
        AVG(total_emission) as avg_emission
      FROM (
        SELECT 
          '1.1' as category_code, 
          'Stationary Combustion' as category_name, 
          emission as total_emission 
        FROM emissions_stationery_combustion_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          '1.2' as category_code, 
          'Mobile Combustion' as category_name, 
          total_emission 
        FROM emissions_mobile_combustion_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          '1.3' as category_code, 
          'Fugitive Emission (WWTP)' as category_name, 
          total_emission 
        FROM emissions_wwtp_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          '1.4' as category_code, 
          'Refrigerant Emission' as category_name, 
          emission as total_emission 
        FROM emissions_refrigerant_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          '2.1' as category_code, 
          'Electricity' as category_name, 
          emission as total_emission 
        FROM emissions_electricity_demo 
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          subcategory_code as category_code, 
          CASE 
            WHEN subcategory_code = '3.1' THEN 'Transport Direct'
            WHEN subcategory_code = '3.11' THEN 'Transport Indirect'
            ELSE 'Transport'
          END as category_name, 
          emission as total_emission 
        FROM emissions_transport_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          '3.2' as category_code, 
          'Downstream Transport' as category_name, 
          emission as total_emission 
        FROM emissions_downstream_transport_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          '3.5' as category_code, 
          'Business Travel' as category_name, 
          emission as total_emission 
        FROM emissions_business_travel_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          '4.1' as category_code, 
          'Purchased Goods' as category_name, 
          emission as total_emission 
        FROM emissions_purchased_goods_demo
        WHERE year = ? ${plantFilter}
        
        UNION ALL
        
        SELECT 
          subcategory_code as category_code, 
          'Other Indirect' as category_name, 
          emission as total_emission 
        FROM emissions_generic
        WHERE year = ? ${plantFilter}
      ) as all_emissions
      GROUP BY category_code, category_name
      ORDER BY total_emission DESC
    `;
    
    // Prepare parameters array - 10 UNION queries
    const queryParams = [];
    for (let i = 0; i < 10; i++) {
      queryParams.push(...baseParams);
    }
    
    console.log('📊 Executing query with params:', queryParams);
    const [results] = await db.execute(query, queryParams);
    
    // Calculate percentages
    const totalEmissions = results.reduce((sum, row) => sum + parseFloat(row.total_emission || 0), 0);
    const analysis = results.map(row => ({
      ...row,
      percentage: totalEmissions > 0 ? ((parseFloat(row.total_emission || 0) / totalEmissions) * 100).toFixed(1) : '0.0',
      total_emission: parseFloat(row.total_emission || 0)
    }));
    
    console.log('📊 Analysis results:', analysis);
    res.json({ success: true, data: analysis, totalEmissions });
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Consumption analysis - COMPLETE WITH ALL TABLES
router.get('/consumption-analysis', async (req, res) => {
  try {
    const { category, year, plant_id } = req.query;
    console.log('🔍 Consumption analysis:', { category, year, plant_id });

    let query, params;
    const plantFilter = plant_id ? 'AND plant_id = ?' : '';
    
    if (category === '1.1') {
      // Stationary combustion
      query = `
        SELECT 
          sub_area,
          factory,
          SUM(COALESCE(debu_per_bulan, 0)) as total_debu,
          SUM(COALESCE(konsumsi_bbm, 0)) as total_bbm,
          SUM(emission) as total_emission,
          COUNT(*) as record_count
        FROM emissions_stationery_combustion_demo
        WHERE year = ? ${plantFilter}
        GROUP BY sub_area, factory
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else if (category === '1.2') {
      // Mobile combustion
      query = `
        SELECT 
          sub_area,
          fuel_type,
          SUM(COALESCE(total_litre, 0)) as total_fuel,
          SUM(total_emission) as total_emission,
          COUNT(*) as record_count,
          AVG(total_emission) as avg_emission_per_record
        FROM emissions_mobile_combustion_demo 
        WHERE year = ? ${plantFilter}
        GROUP BY sub_area, fuel_type
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else if (category === '1.3') {
      // WWTP
      query = `
        SELECT 
          sub_area,
          SUM(COALESCE(population, 0)) as total_population,
          SUM(total_emission) as total_emission,
          COUNT(*) as record_count
        FROM emissions_wwtp_demo
        WHERE year = ? ${plantFilter}
        GROUP BY sub_area
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else if (category === '1.4') {
      // Refrigerant
      query = `
        SELECT 
          freon_type,
          refrigerant_type,
          SUM(quantity) as total_quantity,
          SUM(capacity_kg) as total_capacity,
          SUM(emission) as total_emission,
          COUNT(*) as record_count
        FROM emissions_refrigerant_demo 
        WHERE year = ? ${plantFilter}
        GROUP BY freon_type, refrigerant_type
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else if (category === '2.1') {
      // Electricity
      query = `
        SELECT 
          sub_area,
          SUM(total_kwh) as total_kwh,
          SUM(total_mwh) as total_mwh,
          SUM(emission) as total_emission,
          AVG(emission_factor) as avg_emission_factor,
          COUNT(*) as record_count
        FROM emissions_electricity_demo 
        WHERE year = ? ${plantFilter}
        GROUP BY sub_area
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else if (category === '3.1' || category === '3.11') {
      // Transport
      query = `
        SELECT 
          vehicle_type,
          fuel,
          supplier,
          SUM(COALESCE(total_distance, distance)) as total_distance,
          SUM(emission) as total_emission,
          COUNT(*) as record_count
        FROM emissions_transport_demo 
        WHERE year = ? AND subcategory_code = ? ${plantFilter}
        GROUP BY vehicle_type, fuel, supplier
        ORDER BY total_emission DESC
        LIMIT 20
      `;
      params = plant_id ? [year, category, plant_id] : [year, category];
      
    } else if (category === '3.2') {
      // Downstream Transport
      query = `
        SELECT 
          route,
          vehicle_type,
          fuel,
          SUM(COALESCE(distance, 0)) as total_distance,
          SUM(quantity) as total_quantity,
          SUM(emission) as total_emission,
          COUNT(*) as record_count
        FROM emissions_downstream_transport_demo 
        WHERE year = ? ${plantFilter}
        GROUP BY route, vehicle_type, fuel
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else if (category === '3.5') {
      // Business Travel
      query = `
        SELECT 
          route,
          vehicle_type,
          fuel,
          SUM(distance) as total_distance,
          SUM(emission) as total_emission,
          COUNT(*) as record_count
        FROM emissions_business_travel_demo 
        WHERE year = ? ${plantFilter}
        GROUP BY route, vehicle_type, fuel
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else if (category === '4.1') {
      // Purchased Goods
      query = `
        SELECT 
          material_type,
          SUM(qty) as total_quantity,
          SUM(emission) as total_emission,
          AVG(co2_ef) as avg_emission_factor,
          COUNT(*) as record_count
        FROM emissions_purchased_goods_demo 
        WHERE year = ? ${plantFilter}
        GROUP BY material_type
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, plant_id] : [year];
      
    } else {
      // Generic/Other categories
      query = `
        SELECT 
          subcategory_code as sub_area,
          unit,
          SUM(data) as total_data,
          SUM(emission) as total_emission,
          COUNT(*) as record_count
        FROM emissions_generic 
        WHERE year = ? AND subcategory_code = ? ${plantFilter}
        GROUP BY subcategory_code, unit
        ORDER BY total_emission DESC
      `;
      params = plant_id ? [year, category, plant_id] : [year, category];
    }
    
    const [results] = await db.execute(query, params);
    console.log('🔍 Consumption results:', results);
    res.json({ success: true, data: results, category });
    
  } catch (error) {
    console.error('❌ Consumption analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recommendations engine - WITH ADDITIONAL CATEGORIES
router.get('/recommendations/:category', (req, res) => {
  const { category } = req.params;
  const { emission_level } = req.query;
  
  console.log('💡 Recommendations request:', { category, emission_level });
  
  const recommendations = getRecommendations(category, emission_level);
  res.json({ success: true, recommendations, category });
});

function getRecommendations(category, emissionLevel = 'high') {
  const recommendations = {
    '1.1': {
      high: [
        {
          title: "Tungku Efficiency Improvement",
          description: "Optimize combustion process and reduce working hours",
          impact: "High",
          cost: "Medium", 
          priority: 1
        },
        {
          title: "Alternative Fuel Switch",
          description: "Switch to cleaner burning fuels or biomass",
          impact: "High",
          cost: "High",
          priority: 2
        }
      ]
    },
    '1.2': {
      high: [
        {
          title: "Vehicle Maintenance Program",
          description: "Regular maintenance and route optimization for forklifts",
          impact: "Medium",
          cost: "Low",
          priority: 1
        },
        {
          title: "Electric Vehicle Transition",
          description: "Replace diesel forklifts with electric alternatives",
          impact: "High", 
          cost: "High",
          priority: 2
        }
      ]
    },
    '1.3': {
      high: [
        {
          title: "WWTP Process Optimization",
          description: "Improve wastewater treatment efficiency to reduce CH4/N2O",
          impact: "Medium",
          cost: "Medium",
          priority: 1
        },
        {
          title: "Biogas Capture System",
          description: "Install methane capture and utilization system",
          impact: "High",
          cost: "High",
          priority: 2
        }
      ]
    },
    '1.4': {
      high: [
        {
          title: "Refrigerant Leak Prevention", 
          description: "Regular inspection and maintenance of refrigeration systems",
          impact: "High",
          cost: "Low",
          priority: 1
        },
        {
          title: "Low-GWP Refrigerant Switch",
          description: "Replace high-GWP refrigerants (R-410A, R-134a) with alternatives",
          impact: "High",
          cost: "High", 
          priority: 2
        }
      ]
    },
    '2.1': {
      high: [
        {
          title: "Energy Efficiency Audit",
          description: "LED lighting upgrade and efficient equipment replacement",
          impact: "Medium",
          cost: "Medium",
          priority: 1
        },
        {
          title: "Solar Panel Installation",
          description: "Rooftop solar to reduce grid electricity dependency",
          impact: "High",
          cost: "High",
          priority: 2
        }
      ]
    },
    '3.1': {
      high: [
        {
          title: "Transport Route Optimization",
          description: "Optimize delivery routes and consolidate shipments",
          impact: "Medium",
          cost: "Low",
          priority: 1
        },
        {
          title: "Local Supplier Strategy",
          description: "Source raw materials from suppliers within 50km radius",
          impact: "High",
          cost: "Low",
          priority: 2
        }
      ]
    },
    '3.2': {
      high: [
        {
          title: "Distribution Network Optimization",
          description: "Optimize downstream distribution routes and packaging",
          impact: "Medium",
          cost: "Medium",
          priority: 1
        },
        {
          title: "Intermodal Transportation",
          description: "Combine truck-rail transport for long distance shipments",
          impact: "High",
          cost: "Medium",
          priority: 2
        }
      ]
    },
    '3.5': {
      high: [
        {
          title: "Virtual Meeting Policy", 
          description: "Reduce business travel through video conferencing",
          impact: "Medium",
          cost: "Low",
          priority: 1
        },
        {
          title: "Carbon Offset Program",
          description: "Offset unavoidable business travel emissions",
          impact: "Medium",
          cost: "Medium",
          priority: 2
        }
      ]
    },
    '4.1': {
      high: [
        {
          title: "Supplier Environmental Criteria",
          description: "Include carbon footprint in supplier evaluation matrix",
          impact: "High",
          cost: "Low", 
          priority: 1
        },
        {
          title: "Circular Economy Program",
          description: "Implement material reuse and recycling programs",
          impact: "Medium",
          cost: "Medium",
          priority: 2
        }
      ]
    }
  };
  
  return recommendations[category]?.[emissionLevel] || [
    {
      title: "Data Collection Improvement",
      description: "Enhance emission data collection and monitoring for this category",
      impact: "Medium",
      cost: "Low",
      priority: 1
    }
  ];
}

router.get('/supplier-clustering', getSupplierClustering);

export default router;