import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from '../services/complaintService';
import { sendResponse } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const complaintService = new ComplaintService();

// Create new complaint
export const createComplaint = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user_id, title, description, category } = req.body;

    // Validation
    if (!user_id || !title || !description || !category) {
        throw new AppError('User ID, title, description, and category are required', 400);
    }

    // Validate category
    if (!['plumbing', 'electrical', 'facility', 'other'].includes(category)) {
        throw new AppError('Category must be plumbing, electrical, facility, or other', 400);
    }

    const file = req.file;
    if (file) {
        req.body.attachments = JSON.stringify([{
            filename: file.originalname,
            path: `uploads/${file.filename}`
        }]);
    }

    const complaint = await complaintService.createComplaint(req.body);
    sendResponse(res, 201, 'Complaint submitted successfully', { complaint });
});

// Get all complaints (filtered by role)
export const getComplaints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user_id, role, staff_id } = req.query;
    const complaints = await complaintService.getComplaints({
        user_id: user_id as string,
        role: role as string,
        staff_id: staff_id as string
    });
    sendResponse(res, 200, 'Complaints list', { complaints });
});

// Get complaint by ID
export const getComplaintById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const complaint = await complaintService.getComplaintById(id);
    sendResponse(res, 200, 'Complaint details', { complaint });
});

// Track complaint by Unique ID
export const trackComplaint = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { uniqueId } = req.params;
    const userId = req.query.userId;

    if (!userId) {
        throw new AppError('User ID is required for verification', 400);
    }

    const complaint = await complaintService.getComplaintByUniqueId(uniqueId);

    // Security check: Users can only track their own complaints
    // We convert userId to string for comparison to be safe
    if (String(complaint.user_id) !== String(userId)) {
        throw new AppError('You are not authorized to view this complaint', 403);
    }

    sendResponse(res, 200, 'Complaint tracking details', { complaint });
});


// Update complaint (status, staff assignment, resolution notes)
export const updateComplaint = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    // Basic validation for status if provided
    if (status) {
        const validStatuses = ['Open', 'Assigned', 'In-progress', 'Resolved'];
        if (!validStatuses.includes(status)) {
            throw new AppError('Invalid status value', 400);
        }
    }

    const file = req.file;
    if (file) {
        req.body.resolution_attachments = JSON.stringify([{
            filename: file.originalname,
            path: `uploads/${file.filename}`
        }]);
    }

    const complaint = await complaintService.updateComplaint(id, req.body);
    sendResponse(res, 200, 'Complaint updated successfully', { complaint });
});

// Delete complaint
export const deleteComplaint = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await complaintService.deleteComplaint(id);
    sendResponse(res, 200, 'Complaint deleted successfully');
});

// Get complaint statistics
export const getComplaintStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await complaintService.getComplaintStats();
    sendResponse(res, 200, 'Complaint statistics', stats);
});

// Submit feedback/rating for a complaint
export const submitFeedback = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || !feedback) {
        throw new AppError('Rating and feedback are required', 400);
    }

    await complaintService.submitFeedback(id, rating, feedback);
    sendResponse(res, 200, 'Feedback submitted successfully');
});

