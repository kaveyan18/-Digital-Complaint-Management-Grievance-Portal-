import { Router } from 'express';
import {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    getComplaintStats,
    trackComplaint,
    submitFeedback,
    getComplaintLogs
} from '../controllers/complaintController';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// GET /api/complaints/stats - Get global stats (Public)
router.get('/stats', getComplaintStats);

// GET /api/complaints/track/:uniqueId - Track complaint by unique ID
router.get('/track/:uniqueId', trackComplaint);

// POST /api/complaints - Create new complaint
router.post('/', authenticate, upload.single('attachment'), createComplaint);

// GET /api/complaints - List all complaints
router.get('/', authenticate, getComplaints);

// GET /api/complaints/:id/logs - Get complaint logs
router.get('/:id/logs', authenticate, getComplaintLogs);

// GET /api/complaints/:id - Get specific complaint
router.get('/:id', authenticate, getComplaintById);

// PUT /api/complaints/:id - Update complaint (status, assignment, notes)
router.put('/:id', authenticate, upload.single('attachment'), updateComplaint);

// DELETE /api/complaints/:id - Delete complaint
router.delete('/:id', deleteComplaint);

// POST /api/complaints/:id/feedback - Submit feedback
router.post('/:id/feedback', submitFeedback);

export default router;
