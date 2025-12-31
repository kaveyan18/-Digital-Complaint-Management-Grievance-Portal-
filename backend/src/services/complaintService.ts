import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { ComplaintCreate, ComplaintUpdate, Complaint } from '../models/Complaint';
import { AppError } from '../utils/AppError';
import { generateComplaintId } from '../utils/idGenerator';
import { NotificationService } from './notificationService';

const notificationService = new NotificationService();

export class ComplaintService {
    async logAction(complaint_id: number, user_id: number | null, action: string, details: any): Promise<void> {
        try {
            await pool.execute(
                'INSERT INTO complaint_logs (complaint_id, user_id, action, details) VALUES (?, ?, ?, ?)',
                [complaint_id, user_id, action, JSON.stringify(details)]
            );
        } catch (e) {
            console.error('Failed to log action:', e);
        }
    }

    async getComplaintLogs(complaint_id: string): Promise<any[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT l.*, u.name as user_name, u.role as user_role 
             FROM complaint_logs l 
             LEFT JOIN users u ON l.user_id = u.id 
             WHERE l.complaint_id = ? 
             ORDER BY l.created_at DESC`,
            [complaint_id]
        );
        return rows;
    }

    async createComplaint(complaintData: ComplaintCreate): Promise<Complaint> {
        const { user_id, title, description, category, attachments } = complaintData;
        const complaint_unique_id = generateComplaintId();

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO complaints (user_id, title, description, category, attachments, status, complaint_unique_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, title, description, category, attachments || null, 'Open', complaint_unique_id]
        );

        const newId = result.insertId;
        await this.logAction(newId, user_id, 'CREATED', { title, category });

        return {
            id: newId,
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

    async updateComplaint(id: string, updateData: ComplaintUpdate, userId?: number): Promise<Complaint> {
        const { status, staff_id, resolution_notes, resolution_attachments } = updateData;
        const updates: string[] = [];
        const params: any[] = [];
        const logDetails: any = {};

        if (status) {
            updates.push('status = ?');
            params.push(status);
            logDetails.status = status;
        }

        if (staff_id !== undefined) {
            updates.push('staff_id = ?');
            params.push(staff_id);
            logDetails.staff_id = staff_id;
            if (!status) {
                updates.push('status = ?');
                params.push('Assigned');
                logDetails.status = 'Assigned';
            }
        }

        if (resolution_notes) {
            updates.push('resolution_notes = ?');
            params.push(resolution_notes);
            logDetails.notes = 'Resolution notes updated';
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

        // Log the action
        // Note: userId passed optionally to track WHO made the change
        await this.logAction(parseInt(id), userId || null, status ? 'STATUS_CHANGE' : 'UPDATED', logDetails);

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
            return updatedComplaint;
        }

        // Note: To use userId in updateComplaint, the controller needs to pass it properly. 
        // Assuming the controller extracts user from req.user
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
        // 1. Status Stats
        const [statusStats] = await pool.execute<RowDataPacket[]>(
            'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
        );

        // 2. Category Stats
        const [categoryStats] = await pool.execute<RowDataPacket[]>(
            'SELECT category, COUNT(*) as count FROM complaints GROUP BY category'
        );

        // 3. Total Complaints
        const [totalCount] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM complaints'
        );

        // 4. Staff Count
        const [staffCount] = await pool.execute<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM users WHERE role = 'Staff'"
        );

        // User Count
        const [userCount] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM users'
        );

        // 5. Average Resolution Time (in hours)
        // Only considers tickets that are 'Resolved' and have an updated_at time
        const [resolutionTime] = await pool.execute<RowDataPacket[]>(
            `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avgHours 
             FROM complaints 
             WHERE status = 'Resolved'`
        );

        // 6. Staff Performance (Resolved count per staff)
        const [staffPerformance] = await pool.execute<RowDataPacket[]>(
            `SELECT u.name, COUNT(c.id) as resolved_count 
             FROM complaints c 
             JOIN users u ON c.staff_id = u.id 
             WHERE c.status = 'Resolved' 
             GROUP BY c.staff_id`
        );

        // Find resolved count from statusStats for summary
        const resolvedStat = statusStats.find(s => s.status === 'Resolved');
        const resolvedCount = resolvedStat ? resolvedStat.count : 0;

        return {
            total: totalCount[0].total,
            resolved: resolvedCount,
            activeStaff: staffCount[0].count,
            totalUsers: userCount[0].count,
            avgResolutionTime: parseFloat(resolutionTime[0].avgHours || 0).toFixed(1),
            byStatus: statusStats,
            byCategory: categoryStats,
            staffPerformance: staffPerformance
        };
    }
}
