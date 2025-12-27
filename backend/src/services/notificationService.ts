import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Notification, NotificationCreate } from '../models/Notification';

export class NotificationService {
    async createNotification(data: NotificationCreate): Promise<void> {
        const { user_id, message } = data;
        await pool.execute(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [user_id, message]
        );
    }

    async getNotificationsByUserId(userId: string): Promise<Notification[]> {
        const [notifications] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );
        return notifications as Notification[];
    }

    async getUnreadCount(userId: string): Promise<number> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        return rows[0].count;
    }

    async markAsRead(notificationId: string): Promise<void> {
        await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE id = ?',
            [notificationId]
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [userId]
        );
    }
}
