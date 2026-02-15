// ============================================================
// Auth Routes
// ============================================================
// POST /api/auth/register — Register a new user
// POST /api/auth/login    — Login and get JWT token
// GET  /api/auth/me       — Get current user profile
// ============================================================

const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);

module.exports = router;
