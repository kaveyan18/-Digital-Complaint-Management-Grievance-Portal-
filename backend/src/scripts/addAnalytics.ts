
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';

async function migrate_analytics() {
    console.log('Starting Analytics migration...');
    try {
        console.log('Adding rating and feedback columns to complaints table (if missing)...');

        let added = 0;

        try {
            await pool.query(
                `ALTER TABLE complaints ADD COLUMN rating INT DEFAULT NULL`
            );
            console.log('Column rating added.');
            added++;
        } catch (e: any) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        }

        try {
            await pool.query(
                `ALTER TABLE complaints ADD COLUMN feedback TEXT DEFAULT NULL`
            );
            console.log('Column feedback added.');
            added++;
        } catch (e: any) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        }

        if (added === 0) console.log('Columns already exist.');

        console.log('Analytics migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate_analytics();
