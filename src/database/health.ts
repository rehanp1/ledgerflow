import { pool } from './pool';

export const checkDatabaseConnection = async (): Promise<void> => {
    await pool.query("SELECT 1");
    console.log("Database connection successful");
}

