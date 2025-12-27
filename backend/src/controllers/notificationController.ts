import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { sendResponse } from '../utils/responseHelper';
import { catchAsync } from '../utils/catchAsync';

const notificationService = new NotificationService();

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const notifications = await notificationService.getNotificationsByUserId(userId);
    const unreadCount = await notificationService.getUnreadCount(userId);
    sendResponse(res, 200, 'Notifications list', { notifications, unreadCount });
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await notificationService.markAsRead(id);
    sendResponse(res, 200, 'Notification marked as read');
});

export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.body;
    await notificationService.markAllAsRead(userId);
    sendResponse(res, 200, 'All notifications marked as read');
});
