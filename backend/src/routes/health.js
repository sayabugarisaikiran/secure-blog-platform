// ============================================================
// Health Check Route
// ============================================================
// GET /api/health — Returns server + database status
// Used by: ALB health checks, ECS task health, monitoring
// ============================================================

const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

router.get('/', async (req, res) => {
    try {
        // Test database connection
        await sequelize.authenticate();

        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: 'connected',
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message,
        });
    }
});

module.exports = router;
