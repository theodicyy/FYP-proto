// Load .env first from backend directory so all code sees correct DB config
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import app from './app.js';
import { logger } from './src/utils/logger.js';
import './src/config/database.js'; // Initialize database connection
import { autoFixPasswords } from './src/utils/passwordFix.js';

const PORT = process.env.PORT || 3000;

// Auto-fix passwords on startup (runs asynchronously, doesn't block server)
autoFixPasswords().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  // If password fix fails, still start server but log error
  logger.error('Password auto-fix failed, starting server anyway', { error: error.message });
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
