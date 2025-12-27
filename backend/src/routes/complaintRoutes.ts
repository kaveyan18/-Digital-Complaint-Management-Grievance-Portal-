import { Router } from 'express';
import {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    getComplaintStats,
    trackComplaint,
    submitFeedback
} from '../controllers/complaintController';
import { upload } from '../middleware/upload';

const router = Router();

// GET /api/complaints/stats - Get complaint statistics (optional - admin)
router.get('/stats', getComplaintStats);

// GET /api/complaints/track/:uniqueId - Track complaint by unique ID
router.get('/track/:uniqueId', trackComplaint);

// POST /api/complaints - Create new complaint
router.post('/', upload.single('attachment'), createComplaint);

// GET /api/complaints - Get all complaints (filtered by role/user)
router.get('/', getComplaints);

// GET /api/complaints/:id - Get complaint by ID
router.get('/:id', getComplaintById);

// PUT /api/complaints/:id - Update complaint (status, assignment, notes)
router.put('/:id', upload.single('attachment'), updateComplaint);

// DELETE /api/complaints/:id - Delete complaint
router.delete('/:id', deleteComplaint);

// POST /api/complaints/:id/feedback - Submit feedback
router.post('/:id/feedback', submitFeedback);

export default router;
