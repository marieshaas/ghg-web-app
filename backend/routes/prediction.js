// routes/prediction.js
// Calls Python Flask microservice (ml_service.py) instead of spawning a new process per request
import express from 'express';

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

router.get('/next-month/total', async (_req, res) => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/predict/total`, {
            signal: AbortSignal.timeout(10000)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('ML service unavailable:', error.message);
        res.status(500).json({ success: false, error: 'ML service unavailable', details: error.message });
    }
});

router.get('/next-month/suppliers', async (_req, res) => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/predict/suppliers`, {
            signal: AbortSignal.timeout(15000)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('ML service unavailable:', error.message);
        res.status(500).json({ success: false, error: 'ML service unavailable', details: error.message });
    }
});

router.get('/health', async (_req, res) => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/health`, {
            signal: AbortSignal.timeout(5000)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(503).json({ status: 'unavailable', error: error.message });
    }
});

export default router;
