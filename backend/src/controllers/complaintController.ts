import { Request, Response } from 'express';
import pool from '../config/database';
import { ComplaintCreate, ComplaintUpdate } from '../models/Complaint';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Create new complaint
export const createComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, title, description, category, attachments }: ComplaintCreate = req.body;

        // Validation
        if (!user_id || !title || !description || !category) {
            res.status(400).json({ message: 'User ID, title, description, and category are required' });
            return;
        }

        // Validate category
        if (!['plumbing', 'electrical', 'facility', 'other'].includes(category)) {
            res.status(400).json({ message: 'Category must be plumbing, electrical, facility, or other' });
            return;
        }

        // Insert complaint
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO complaints (user_id, title, description, category, attachments, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, title, description, category, attachments || null, 'Open']
        );

        res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint: {
                id: result.insertId,
                user_id,
                title,
                description,
                category,
                status: 'Open',
                attachments
            }
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all complaints (filtered by role)
export const getComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, role, staff_id } = req.query;

        let query = `
      SELECT c.*, 
             u.name as user_name, u.email as user_email,
             s.name as staff_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.staff_id = s.id
    `;
        const params: any[] = [];

        // Filter based on role
        if (role === 'User' && user_id) {
            query += ' WHERE c.user_id = ?';
            params.push(user_id);
        } else if (role === 'Staff' && staff_id) {
            query += ' WHERE c.staff_id = ?';
            params.push(staff_id);
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await pool.execute<RowDataPacket[]>(query, params);

        res.status(200).json({ complaints });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get complaint by ID
export const getComplaintById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const [complaints] = await pool.execute<RowDataPacket[]>(
            `SELECT c.*, 
              u.name as user_name, u.email as user_email,
              s.name as staff_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.staff_id = s.id
       WHERE c.id = ?`,
            [id]
        );

        if (complaints.length === 0) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }

        res.status(200).json({ complaint: complaints[0] });
    } catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update complaint (status, staff assignment, resolution notes)
export const updateComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, staff_id, resolution_notes }: ComplaintUpdate = req.body;

        // Build update query dynamically
        const updates: string[] = [];
        const params: any[] = [];

        if (status) {
            // Validate status flow: Open → Assigned → In-progress → Resolved
            const validStatuses = ['Open', 'Assigned', 'In-progress', 'Resolved'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({ message: 'Invalid status value' });
                return;
            }
            updates.push('status = ?');
            params.push(status);
        }

        if (staff_id !== undefined) {
            updates.push('staff_id = ?');
            params.push(staff_id);
            // If assigning staff and status is Open, set to Assigned
            if (!status) {
                updates.push('status = ?');
                params.push('Assigned');
            }
        }

        if (resolution_notes) {
            updates.push('resolution_notes = ?');
            params.push(resolution_notes);
        }

        if (updates.length === 0) {
            res.status(400).json({ message: 'No update fields provided' });
            return;
        }

        params.push(id);

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }

        // Fetch updated complaint
        const [complaints] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM complaints WHERE id = ?',
            [id]
        );

        res.status(200).json({ message: 'Complaint updated successfully', complaint: complaints[0] });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete complaint
export const deleteComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM complaints WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }

        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get complaint statistics (for admin dashboard - optional)
export const getComplaintStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [statusStats] = await pool.execute<RowDataPacket[]>(
            'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
        );

        const [categoryStats] = await pool.execute<RowDataPacket[]>(
            'SELECT category, COUNT(*) as count FROM complaints GROUP BY category'
        );

        const [totalCount] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM complaints'
        );

        res.status(200).json({
            total: totalCount[0].total,
            byStatus: statusStats,
            byCategory: categoryStats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
