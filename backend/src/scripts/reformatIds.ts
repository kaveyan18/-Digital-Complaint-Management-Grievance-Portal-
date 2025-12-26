
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import pool from '../config/database';
import { generateComplaintId } from '../utils/idGenerator';
import { RowDataPacket } from 'mysql2';

async function reformatIds() {
    console.log('Starting ID reformat migration...');

    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM complaints');
        console.log(`Found ${rows.length} complaints to update.`);

        for (const row of rows) {
            const newId = generateComplaintId();
            await pool.query('UPDATE complaints SET complaint_unique_id = ? WHERE id = ?', [newId, row.id]);
            console.log(`Updated complaint ${row.id} to new format ID: ${newId}`);
        }

        console.log('Reformat complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

reformatIds();
