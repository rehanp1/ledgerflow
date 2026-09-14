import app from './app';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './database/health';
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await checkDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`LedgerFlow running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();