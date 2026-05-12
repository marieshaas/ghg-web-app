CREATE DATABASE ghg_tracker;
ghgcii
ghgcii2025

-- Tabel untuk data plants
CREATE TABLE plants (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk categories dan subcategories
CREATE TABLE categories (
    id INT PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(200) NOT NULL,
    parent_id INT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Tabel untuk Electricity (2.1)
CREATE TABLE emissions_electricity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT NOT NULL,
    period VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    lwbp DECIMAL(15,3) NOT NULL,
    wbp DECIMAL(15,3) NOT NULL,
    total_kwh DECIMAL(15,3) NOT NULL,
    total_mwh DECIMAL(15,6) NOT NULL,
    emission_factor DECIMAL(10,6) NOT NULL,
    gwp DECIMAL(5,2) NOT NULL,
    emission DECIMAL(15,4) NOT NULL,
    uploaded_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    INDEX idx_plant_period (plant_id, year, month)
);

-- Tabel untuk Transport (3.1, 3.11)
CREATE TABLE emissions_transport (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT NOT NULL,
    subcategory_code VARCHAR(10) NOT NULL,
    period VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    supplier VARCHAR(200) NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    size VARCHAR(50) NULL,
    fuel VARCHAR(50) NULL,
    distance DECIMAL(15,3) NULL, --modify jd 2
    quantity INT NULL,
    total_distance DECIMAL(15,3) NULL,
    co2_ef DECIMAL(10,6) NOT NULL, --modify jd 2
    co2_gwp DECIMAL(5,2) NOT NULL,
    co2 DECIMAL(15,6) NOT NULL,
    ch4_ef DECIMAL(10,6) NOT NULL,
    ch4_gwp DECIMAL(5,2) NOT NULL,
    ch4 DECIMAL(15,6) NOT NULL,
    n2o_ef DECIMAL(10,6) NOT NULL,
    n2o_gwp DECIMAL(5,2) NOT NULL,
    n2o DECIMAL(15,6) NOT NULL,
    emission DECIMAL(15,12) NOT NULL, --modify jd 12 lagi
    uploaded_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    INDEX idx_plant_period (plant_id, year, month),
    INDEX idx_subcategory (subcategory_code)
);

-- Tabel untuk Business Travel (3.5)
CREATE TABLE emissions_business_travel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT NOT NULL,
    period VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    route VARCHAR(200) NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    size VARCHAR(50) NULL,
    fuel VARCHAR(50) NULL,
    distance DECIMAL(15,3) NOT NULL,
    co2_ef DECIMAL(10,6) NOT NULL,
    co2_gwp DECIMAL(5,2) NOT NULL,
    co2 DECIMAL(15,6) NOT NULL,
    ch4_ef DECIMAL(10,6) NOT NULL,
    ch4_gwp DECIMAL(5,2) NOT NULL,
    ch4 DECIMAL(15,6) NOT NULL,
    n2o_ef DECIMAL(10,6) NOT NULL,
    n2o_gwp DECIMAL(5,2) NOT NULL,
    n2o DECIMAL(15,6) NOT NULL,
    emission DECIMAL(15,12) NOT NULL,
    uploaded_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    INDEX idx_plant_period (plant_id, year, month)
);

-- Tabel untuk kategori 1.1
CREATE TABLE emissions_stationery_combustion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT NOT NULL,
    subcategory_code VARCHAR(10) NOT NULL DEFAULT '1.1',
    sub_area VARCHAR(50) NOT NULL, 
    period VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    month INT NULL,
    
    -- Untuk Tungku
    hari_kerja INT NULL,
    factory VARCHAR(50) NULL, 
    berat_debu_per_hari DECIMAL(15,2) NULL,
    debu_per_bulan DECIMAL(15,2) NULL,
    
    -- Untuk Boiler & Genset (future)
    konsumsi_bbm DECIMAL(15,2) NULL,
    
    -- Emission Factors & Results
    co2_ef DECIMAL(10,2) NOT NULL,
    co2_gwp DECIMAL(5,2) NOT NULL,
    co2 DECIMAL(15,6) NOT NULL,
    ch4_ef DECIMAL(10,2) NOT NULL,
    ch4_gwp DECIMAL(5,2) NOT NULL,
    ch4 DECIMAL(15,6) NOT NULL,
    n2o_ef DECIMAL(10,2) NOT NULL,
    n2o_gwp DECIMAL(5,2) NOT NULL,
    n2o DECIMAL(15,6) NOT NULL,
    emission DECIMAL(15,6) NOT NULL,
    
    uploaded_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    INDEX idx_plant_period (plant_id, year, month),
    INDEX idx_subcategory (subcategory_code),
    INDEX idx_sub_area (sub_area)
);

-- Tabel untuk kategori 1.2
CREATE TABLE emissions_mobile_combustion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  period VARCHAR(50) NOT NULL,
  plant_id VARCHAR(10) NOT NULL,
  sub_area VARCHAR(20) NOT NULL, 
  
  fuel_type VARCHAR(100), -
  consume_bbm DECIMAL(15,4), 
  total_litre DECIMAL(15,4),

  co2_ef_fossil DECIMAL(10,4),
  co2_ef_bio DECIMAL(10,4), 
  co2_gwp DECIMAL(10,2),
  ch4_ef_fossil DECIMAL(10,4),
  ch4_gwp DECIMAL(10,2),
  n2o_ef_fossil DECIMAL(10,4),
  n2o_gwp DECIMAL(10,2),
  
  co2_fossil DECIMAL(15,6), 
  co2_bio DECIMAL(15,6), 
  co2 DECIMAL(15,6), 
  ch4 DECIMAL(15,8),
  n2o DECIMAL(15,8),
  
  total_emission DECIMAL(15,6),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_period (period),
  INDEX idx_plant (plant_id),
  INDEX idx_sub_area (sub_area),
  INDEX idx_fuel_type (fuel_type)
);

CREATE TABLE emissions_wwtp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plant_id INT NOT NULL,
  subcategory_code VARCHAR(10) DEFAULT '1.3',
  sub_area VARCHAR(50) DEFAULT 'wwtp',
  period VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  month INT,
  
  population DECIMAL(15,2) NOT NULL,
  protein_consum_per_capita DECIMAL(15,4) NOT NULL,
  organic_degrad_material DECIMAL(15,4),
  sludge_removed DECIMAL(15,4) DEFAULT 0,
  methane_recovered DECIMAL(15,4) DEFAULT 0,
  
  ch4_ef DECIMAL(15,6),
  ch4_gwp DECIMAL(10,2),
  ch4 DECIMAL(15,12),
  
  n2o_ef DECIMAL(15,6),
  n2o_gwp DECIMAL(10,2),
  n2o DECIMAL(15,12),
  total_emission DECIMAL(15,12) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  
  INDEX idx_plant_year (plant_id, year),
  INDEX idx_period (period),
  INDEX idx_subcategory (subcategory_code)
);

-- Tabel untuk kategori 1.4 - Refrigerant Emissions
CREATE TABLE emissions_refrigerant (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT NOT NULL,
    subcategory_code VARCHAR(10) NOT NULL DEFAULT '1.4',
    sub_area VARCHAR(50) NOT NULL DEFAULT 'refrigerant',
    period VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    month INT NULL,
    
    location VARCHAR(255) NULL,
    freon_type VARCHAR(50) NOT NULL,
    refrigerant_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    capacity_gram DECIMAL(15,2) NOT NULL,
    capacity_kg DECIMAL(15,4) NOT NULL,
    
    leakage_rate DECIMAL(5,4) NOT NULL,
    gwp INT NOT NULL,
    
    emission DECIMAL(15,6) NOT NULL,
    
    uploaded_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    INDEX idx_plant_period (plant_id, year, month),
    INDEX idx_subcategory (subcategory_code),
    INDEX idx_sub_area (sub_area),
    INDEX idx_freon_type (freon_type, refrigerant_type)
);

-- Tabel untuk kategori lain 
CREATE TABLE emissions_generic (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT NOT NULL,
    subcategory_code VARCHAR(10) NOT NULL,
    period VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    data DECIMAL(15,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    emission_factor DECIMAL(10,6) NOT NULL,
    emission DECIMAL(15,3) NOT NULL,
    uploaded_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    INDEX idx_plant_period (plant_id, year, month),
    INDEX idx_subcategory (subcategory_code)
);

-- Insert master data
INSERT INTO plants (id, name, location) VALUES 
(1, 'Plant Bogor', 'Bogor, West Java'),
(2, 'Plant Majalengka', 'Majalengka, West Java');

INSERT INTO categories (id, code, name, parent_id) VALUES
(1, '1', 'Direct Emissions', NULL),
(2, '2', 'Indirect Emissions', NULL),
(3, '3', 'Other Indirect Emissions (Transportation)', NULL),
(4, '4', 'Other Indirect Emissions (Product/Material)', NULL),

(11, '1.1', 'Stationary Combustion', 1),
(12, '1.2', 'Mobile Combustion', 1),
(13, '1.3', 'Fugitive Emissions', 1),
(14, '1.4', 'Process Emissions', 1),
(21, '2.1', 'Purchased Electricity', 2),
(22, '2.2', 'Purchased Steam', 2),
(31, '3.1', 'Upstream Transportation', 3),
(32, '3.2', 'Employee Commuting', 3),
(33, '3.5', 'Business Travel', 3),
(34, '3.11', 'Product Distribution', 3),
(41, '4.1', 'Purchased Goods', 4),
(42, '4.2', 'Waste Generated', 4);

-- Run these ALTER statements to fix existing tables
ALTER TABLE emissions_electricity MODIFY emission DECIMAL(15,4) NOT NULL;
ALTER TABLE emissions_transport MODIFY emission DECIMAL(15,4) NOT NULL;
ALTER TABLE emissions_business_travel MODIFY emission DECIMAL(15,4) NOT NULL;
ALTER TABLE emissions_generic MODIFY emission DECIMAL(15,4) NOT NULL;

-- Also fix related columns in transport and business_travel
ALTER TABLE emissions_transport MODIFY co2 DECIMAL(15,4) NOT NULL;
ALTER TABLE emissions_transport MODIFY ch4 DECIMAL(15,4) NOT NULL;
ALTER TABLE emissions_transport MODIFY n2o DECIMAL(15,4) NOT NULL;

ALTER TABLE emissions_business_travel MODIFY co2 DECIMAL(15,4) NOT NULL;
ALTER TABLE emissions_business_travel MODIFY ch4 DECIMAL(15,4) NOT NULL;
ALTER TABLE emissions_business_travel MODIFY n2o DECIMAL(15,4) NOT NULL;

ALTER TABLE emissions_stationery_combustion 
ADD COLUMN co2_ef_diesel DECIMAL(10,6) NULL AFTER debu_per_bulan,
ADD COLUMN co2_ef_bio DECIMAL(10,6) NULL AFTER co2_ef_diesel,
ADD COLUMN ch4_ef_diesel DECIMAL(10,6) NULL AFTER co2_ef_bio,
ADD COLUMN ch4_ef_bio DECIMAL(10,6) NULL AFTER ch4_ef_diesel,
ADD COLUMN n2o_ef_diesel DECIMAL(10,6) NULL AFTER ch4_ef_bio,
ADD COLUMN n2o_ef_bio DECIMAL(10,6) NULL AFTER n2o_ef_diesel;

ALTER TABLE emissions_stationery_combustion 
MODIFY co2_ef DECIMAL(10,6) NULL,
MODIFY ch4_ef DECIMAL(10,6) NULL,
MODIFY n2o_ef DECIMAL(10,6) NULL;

ALTER TABLE emissions_stationery_combustion 
MODIFY konsumsi_bbm DECIMAL(15,3) NULL;

ALTER TABLE emissions_stationery_combustion 
MODIFY emission DECIMAL(15,4) NOT NULL;