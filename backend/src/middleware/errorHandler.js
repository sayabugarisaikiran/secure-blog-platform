// ============================================================
// Error Handler Middleware
// ============================================================
// Centralized error handling for the entire app
// ============================================================

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages,
        });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            message: 'Resource already exists',
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
};

module.exports = errorHandler;
