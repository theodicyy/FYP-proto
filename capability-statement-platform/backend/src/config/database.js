import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  logger.error('Missing required environment variables', { missing: missingVars });
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'capability_statement_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    logger.info('Database connected successfully', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
    connection.release();
  })
  .catch(err => {
    logger.error('Database connection error', { 
      error: err.message,
      host: dbConfig.host,
      port: dbConfig.port
    });
  });

export default pool;
