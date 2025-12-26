
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';
import { generateComplaintId } from '../utils/idGenerator';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function migrate() {
    console.log('Starting migration...');

    try {
        // 1. Add column if not exists
        // MySQL doesn't have "IF NOT EXISTS" for ADD COLUMN in all versions easily, 
        // but we can try-catch or check information_schema.
        // Or just run it and ignore error if duplicate column.

        try {
            console.log('Adding complaint_unique_id column...');
            await pool.query(
                `ALTER TABLE complaints ADD COLUMN complaint_unique_id VARCHAR(50) UNIQUE DEFAULT NULL`
            );
            console.log('Column added.');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists, skipping.');
            } else {
                throw e;
            }
        }

        // 2. Fetch rows with NULL or Empty complaint_unique_id
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM complaints WHERE complaint_unique_id IS NULL OR complaint_unique_id = ''"
        );
        console.log(`Found ${rows.length} complaints to backfill.`);

        // 3. Backfill IDs
        for (const row of rows) {
            const newId = generateComplaintId();
            await pool.query('UPDATE complaints SET complaint_unique_id = ? WHERE id = ?', [newId, row.id]);
            console.log(`Updated complaint ${row.id} with ID ${newId}`);
        }

        // 4. Verify
        const [remaining] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM complaints WHERE complaint_unique_id IS NULL OR complaint_unique_id = ''"
        );
        console.log(`Remaining un-migrated rows: ${remaining[0].count}`);

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
