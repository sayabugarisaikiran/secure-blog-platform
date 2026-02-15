// ============================================================
// Express Application Entry Point
// ============================================================
// This is the heart of Tier 2 (Application Layer)
// 
// Architecture:
//   Tier 1 (Presentation) → Nginx/CloudFront
//   Tier 2 (Application)  → THIS (Express API)  ← You are here
//   Tier 3 (Data)         → PostgreSQL (RDS)
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Middleware Stack
// ============================================================

// Security headers
app.use(helmet());

// CORS — Allow frontend to talk to backend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use(morgan('combined'));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per window
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});
app.use('/api/', limiter);

// ============================================================
// Routes
// ============================================================

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Secure Blog Platform API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            posts: '/api/posts',
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

const startServer = async () => {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Sync models (create tables if they don't exist)
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Database models synced');

        // Start listening
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Export for testing
module.exports = app;

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
