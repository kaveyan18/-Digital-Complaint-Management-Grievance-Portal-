
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';

async function migrate() {
    console.log('Starting Notifications & Feedback migration...');

    try {
        // 1. Create Notifications Table
        console.log('Creating notifications table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 2. Add Feedback and Rating to Complaints Table
        console.log('Adding feedback columns to complaints...');
        // Check if columns exist first to avoid errors
        const [columns] = await pool.query('SHOW COLUMNS FROM complaints');
        const columnNames = (columns as any[]).map(c => c.Field);

        if (!columnNames.includes('rating')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN rating INT DEFAULT NULL');
        }
        if (!columnNames.includes('feedback')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN feedback TEXT DEFAULT NULL');
        }

        console.log('Migration complete successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
