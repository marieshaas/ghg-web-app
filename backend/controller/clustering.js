// backend/controller/clustering.js
import { db } from '../server.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Cache ────────────────────────────────────────────────────────────────────
const clusteringCache = new Map(); // key → { result, computed_at }
const CACHE_FILE = path.join(__dirname, '../cache/clustering_cache.json');

function loadCacheFromFile() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      for (const [key, value] of Object.entries(data)) {
        clusteringCache.set(key, value);
      }
      console.log(`[clustering-cache] Loaded ${clusteringCache.size} entries from file`);
    }
  } catch (e) {
    console.error('[clustering-cache] Failed to load cache file:', e.message);
  }
}

function saveCacheToFile() {
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const obj = Object.fromEntries(clusteringCache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error('[clustering-cache] Failed to save cache file:', e.message);
  }
}

function getCacheKey(plantId, removeOutliers) {
  return `${plantId || 'all'}_${removeOutliers ? 'no_outliers' : 'with_outliers'}`;
}

// Load persisted cache saat modul pertama kali di-import
loadCacheFromFile();

// ─── Core computation ─────────────────────────────────────────────────────────
async function computeClustering(plantId, removeOutliers) {
  const query = `
    SELECT
      plant_id,
      supplier,
      SUM(emission) as total_emission,
      COUNT(*) as frequency
    FROM emissions_transport_demo
    WHERE subcategory_code IN ('3.1', '3.11')
    ${plantId ? 'AND plant_id = ?' : ''}
    GROUP BY plant_id, supplier
  `;

  const [rows] = await db.execute(query, plantId ? [plantId] : []);

  if (rows.length === 0) {
    return { metrics: { silhouette_score: 0, davies_bouldin_index: 0 }, clusters: [], suppliers: [] };
  }

  const suppliers = rows
    .map(row => ({
      plant_id: row.plant_id,
      supplier: String(row.supplier || 'Unknown'),
      total_emission: parseFloat(row.total_emission) || 0,
      frequency: parseInt(row.frequency) || 0,
    }))
    .filter(s => s.frequency > 0 && s.total_emission > 0);

  if (suppliers.length === 0) {
    return { metrics: { silhouette_score: 0, davies_bouldin_index: 999 }, clusters: [], suppliers: [] };
  }

  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `suppliers_${Date.now()}.json`);
  const outputFile = path.join(tempDir, `result_${Date.now()}.json`);

  fs.writeFileSync(inputFile, JSON.stringify({ suppliers, removeOutliers: !!removeOutliers }));

  const pythonScript = path.join(__dirname, '../cluster/clustering.py');

  return new Promise((resolve, reject) => {
    const python = spawn('python', [pythonScript, inputFile, outputFile]);

    let error = '';
    python.stderr.on('data', (d) => (error += d.toString()));

    python.on('close', (code) => {
      fs.unlink(inputFile, () => {});

      if (code !== 0) {
        fs.unlink(outputFile, () => {});
        return reject(new Error(`Python failed: ${error}`));
      }

      fs.readFile(outputFile, 'utf8', (err, data) => {
        fs.unlink(outputFile, () => {});
        if (err) return reject(new Error('Read error'));
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });
  });
}

// ─── Semua kombinasi yang di-cache ────────────────────────────────────────────
const ALL_VARIANTS = [
  { plantId: null, removeOutliers: true  },
  { plantId: null, removeOutliers: false },
  { plantId: '1',  removeOutliers: true  },
  { plantId: '1',  removeOutliers: false },
  { plantId: '2',  removeOutliers: true  },
  { plantId: '2',  removeOutliers: false },
];

// Dipanggil oleh cron quarterly DAN saat server pertama start
export async function refreshAllClusteringCache() {
  console.log('[clustering-cache] Refreshing all variants...');
  for (const { plantId, removeOutliers } of ALL_VARIANTS) {
    const key = getCacheKey(plantId, removeOutliers);
    try {
      const result = await computeClustering(plantId, removeOutliers);
      clusteringCache.set(key, { result, computed_at: new Date().toISOString() });
      console.log(`[clustering-cache] Updated: ${key}`);
    } catch (e) {
      console.error(`[clustering-cache] Failed for ${key}:`, e.message);
    }
  }
  saveCacheToFile();
  console.log('[clustering-cache] Refresh complete');
}

// ─── API handler ──────────────────────────────────────────────────────────────
export default async function getSupplierClustering(req, res) {
  try {
    const { plantId, removeOutliers = false } = req.query;
    const removeOutliersBool = removeOutliers === 'true' || removeOutliers === true;
    const cacheKey = getCacheKey(plantId, removeOutliersBool);

    // Fast path: serve from cache
    const cached = clusteringCache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached.result, cached: true, computed_at: cached.computed_at });
    }

    // Cache miss — hitung on-demand, simpan untuk berikutnya
    console.log(`[clustering-cache] Cache miss for "${cacheKey}", computing on demand...`);
    const result = await computeClustering(plantId, removeOutliersBool);
    const computed_at = new Date().toISOString();
    clusteringCache.set(cacheKey, { result, computed_at });
    saveCacheToFile();

    return res.json({ ...result, cached: false, computed_at });
  } catch (error) {
    console.error('Clustering controller error:', error);
    res.status(500).json({ error: error.message });
  }
}
