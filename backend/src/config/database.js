// ============================================================
// Database Configuration — Sequelize + PostgreSQL
// ============================================================
// This connects our app (Tier 2) to the database (Tier 3)
// In local dev: connects to Docker PostgreSQL container
// In production: connects to AWS RDS
// ============================================================

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'blogdb',
  process.env.DB_USER || 'bloguser',
  process.env.DB_PASSWORD || 'blogpass123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
