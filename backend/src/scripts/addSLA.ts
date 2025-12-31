
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';

async function migrate_sla() {
    console.log('Starting SLA migration...');
    try {
        console.log('Adding SLA columns to complaints table...');

        // Add sla_deadline
        try {
            await pool.query(
                `ALTER TABLE complaints ADD COLUMN sla_deadline DATETIME DEFAULT NULL`
            );
            console.log('Column sla_deadline added.');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('sla_deadline already exists.');
            else throw e;
        }

        // Add is_escalated
        try {
            await pool.query(
                `ALTER TABLE complaints ADD COLUMN is_escalated BOOLEAN DEFAULT FALSE`
            );
            console.log('Column is_escalated added.');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('is_escalated already exists.');
            else throw e;
        }

        console.log('SLA migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate_sla();
