import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = Router();

router.get('/:userId', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
