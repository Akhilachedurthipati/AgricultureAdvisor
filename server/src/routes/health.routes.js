import express from 'express';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    success: true,
    message: 'Agriculture Advisor Backend API is running smoothly.',
    service: 'AGRICULTURE ADVISOR API',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    version: '1.0.0'
  });
});

export default router;
