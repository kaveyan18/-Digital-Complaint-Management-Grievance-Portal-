import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { ComplaintCreate, ComplaintUpdate, Complaint } from '../models/Complaint';
import { AppError } from '../utils/AppError';
import { generateComplaintId } from '../utils/idGenerator';
import { NotificationService } from './notificationService';

const notificationService = new NotificationService();

export class ComplaintService {
    async createComplaint(complaintData: ComplaintCreate): Promise<Complaint> {
        const { user_id, title, description, category, attachments } = complaintData;
        const complaint_unique_id = generateComplaintId();

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO complaints (user_id, title, description, category, attachments, status, complaint_unique_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, title, description, category, attachments || null, 'Open', complaint_unique_id]
        );

        return {
            id: result.insertId,
            user_id,
            title,
            description,
            category,
            status: 'Open',
            attachments,
            complaint_unique_id,
            created_at: new Date() // Approximate for response
        };
    }

    async getComplaintByUniqueId(uniqueId: string): Promise<Complaint> {
        const [complaints] = await pool.execute<RowDataPacket[]>(
            `SELECT c.*, 
              u.name as user_name, u.email as user_email,
              s.name as staff_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.staff_id = s.id
       WHERE c.complaint_unique_id = ?`,
            [uniqueId]
        );

        if (complaints.length === 0) {
            throw new AppError('Complaint not found', 404);
        }

        return complaints[0] as Complaint;
    }

    async getComplaints(filters: { user_id?: string; role?: string; staff_id?: string }): Promise<Complaint[]> {
        const { user_id, role, staff_id } = filters;

        let query = `
      SELECT c.*, 
             u.name as user_name, u.email as user_email,
             s.name as staff_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.staff_id = s.id
    `;
        const params: any[] = [];

        if (role === 'User' && user_id) {
            query += ' WHERE c.user_id = ?';
            params.push(user_id);
        } else if (role === 'Staff' && staff_id) {
            query += ' WHERE c.staff_id = ?';
            params.push(staff_id);
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await pool.execute<RowDataPacket[]>(query, params);
        return complaints as Complaint[];
    }

    async getComplaintById(id: string): Promise<Complaint> {
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
            throw new AppError('Complaint not found', 404);
        }

        return complaints[0] as Complaint;
    }

    async updateComplaint(id: string, updateData: ComplaintUpdate): Promise<Complaint> {
        const { status, staff_id, resolution_notes, resolution_attachments } = updateData;
        const updates: string[] = [];
        const params: any[] = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (staff_id !== undefined) {
            updates.push('staff_id = ?');
            params.push(staff_id);
            if (!status) {
                updates.push('status = ?');
                params.push('Assigned');
            }
        }

        if (resolution_notes) {
            updates.push('resolution_notes = ?');
            params.push(resolution_notes);
        }

        if (resolution_attachments) {
            updates.push('resolution_attachments = ?');
            params.push(resolution_attachments);
        }

        if (updates.length === 0) {
            throw new AppError('No update fields provided', 400);
        }

        params.push(id);

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            throw new AppError('Complaint not found', 404);
        }

        // Fetch updated complaint
        const updatedComplaint = await this.getComplaintById(id);

        // Notify user of status change
        if (status) {
            await notificationService.createNotification({
                user_id: updatedComplaint.user_id,
                message: `Your complaint #${updatedComplaint.complaint_unique_id || id} status has been updated to ${status}.`
            });

            // Mock email alert
            const userEmail = (updatedComplaint as any).user_email || 'user@example.com';
            console.log(`[EMAIL ALERT] To: ${userEmail}, Message: Your complaint status is now ${status}.`);
        }

        return updatedComplaint;
    }

    async submitFeedback(id: string, rating: number, feedback: string): Promise<void> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE complaints SET rating = ?, feedback = ? WHERE id = ?',
            [rating, feedback, id]
        );

        if (result.affectedRows === 0) {
            throw new AppError('Complaint not found', 404);
        }
    }

    async deleteComplaint(id: string): Promise<void> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM complaints WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new AppError('Complaint not found', 404);
        }
    }

    async getComplaintStats(): Promise<any> {
        const [statusStats] = await pool.execute<RowDataPacket[]>(
            'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
        );

        const [categoryStats] = await pool.execute<RowDataPacket[]>(
            'SELECT category, COUNT(*) as count FROM complaints GROUP BY category'
        );

        const [totalCount] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM complaints'
        );

        const [staffCount] = await pool.execute<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM users WHERE role IN ('Staff', 'Admin')"
        );

        const [resolutionTime] = await pool.execute<RowDataPacket[]>(
            "SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avgHours FROM complaints WHERE status = 'Resolved'"
        );

        // Find resolved count from statusStats
        const resolvedStat = statusStats.find(s => s.status === 'Resolved');
        const resolvedCount = resolvedStat ? resolvedStat.count : 0;

        return {
            total: totalCount[0].total,
            resolved: resolvedCount,
            activeStaff: staffCount[0].count,
            avgResolutionTime: 24, // Hardcoded to 24 as requested
            byStatus: statusStats,
            byCategory: categoryStats
        };
    }
}
