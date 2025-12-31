
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';

async function migrate_audit() {
    console.log('Starting Audit Trail migration...');
    try {
        console.log('Creating complaint_logs table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS complaint_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                complaint_id INT NOT NULL,
                user_id INT, -- Who performed the action (User/Staff/Admin)
                action VARCHAR(50) NOT NULL, -- 'CREATED', 'ASSIGNED', 'STATUS_CHANGE', 'RESOLVED'
                details TEXT, -- JSON or text description
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('Table complaint_logs created.');

        console.log('Audit Trail migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate_audit();
