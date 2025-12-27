
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';

async function migrate() {
    console.log('Starting File Upload & Effort Tracking migration...');

    try {
        const [columns] = await pool.query('SHOW COLUMNS FROM complaints');
        const columnNames = (columns as any[]).map(c => c.Field);

        // 1. Add effort_hours column
        if (!columnNames.includes('effort_hours')) {
            console.log('Adding effort_hours column...');
            await pool.query('ALTER TABLE complaints ADD COLUMN effort_hours DECIMAL(5,2) DEFAULT 0.00');
        }

        // 2. Add resolution_attachments column
        if (!columnNames.includes('resolution_attachments')) {
            console.log('Adding resolution_attachments column...');
            await pool.query('ALTER TABLE complaints ADD COLUMN resolution_attachments TEXT DEFAULT NULL');
        }

        // 3. Ensure attachments can store longer strings (for JSON array of file paths)
        console.log('Updating attachments column type...');
        await pool.query('ALTER TABLE complaints MODIFY COLUMN attachments TEXT DEFAULT NULL');

        console.log('Migration complete successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
