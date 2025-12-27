
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';

async function migrate() {
    console.log('Removing Effort Tracking components...');

    try {
        const [columns] = await pool.query('SHOW COLUMNS FROM complaints');
        const columnNames = (columns as any[]).map(c => c.Field);

        if (columnNames.includes('effort_hours')) {
            console.log('Dropping effort_hours column...');
            await pool.query('ALTER TABLE complaints DROP COLUMN effort_hours');
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

migrate();
