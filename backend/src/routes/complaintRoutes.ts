import { Router } from 'express';
import {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    getComplaintStats
} from '../controllers/complaintController';

const router = Router();

// GET /api/complaints/stats - Get complaint statistics (optional - admin)
router.get('/stats', getComplaintStats);

// POST /api/complaints - Create new complaint
router.post('/', createComplaint);

// GET /api/complaints - Get all complaints (filtered by role/user)
router.get('/', getComplaints);

// GET /api/complaints/:id - Get complaint by ID
router.get('/:id', getComplaintById);

// PUT /api/complaints/:id - Update complaint (status, assignment, notes)
router.put('/:id', updateComplaint);

// DELETE /api/complaints/:id - Delete complaint
router.delete('/:id', deleteComplaint);

export default router;
