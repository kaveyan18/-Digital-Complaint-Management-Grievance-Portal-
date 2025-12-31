
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';

async function migrate_skills() {
    console.log('Starting skills migration...');
    try {
        console.log('Adding skills column to users table...');
        await pool.query(
            `ALTER TABLE users ADD COLUMN skills TEXT DEFAULT NULL`
        );
        console.log('Column skills added successfully.');
    } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column skills already exists, skipping.');
        } else {
            console.error('Error adding column:', e);
        }
    }
    process.exit(0);
}

migrate_skills();
