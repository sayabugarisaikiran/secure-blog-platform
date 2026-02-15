// ============================================================
// Auth Controller — Register & Login
// ============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Create user (password is hashed by model hook)
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'user',
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/me
const getProfile = async (req, res) => {
    res.json({
        success: true,
        data: { user: req.user.toJSON() },
    });
};

module.exports = { register, login, getProfile };
