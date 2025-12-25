import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { sendResponse } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const userService = new UserService();

// Register new user
export const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
        throw new AppError('Name, email, password, and role are required', 400);
    }

    // Validate role
    if (!['User', 'Staff', 'Admin'].includes(role)) {
        throw new AppError('Role must be User, Staff, or Admin', 400);
    }

    const user = await userService.registerUser(req.body);
    sendResponse(res, 201, 'User registered successfully', { user });
});

// Login user
export const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const user = await userService.loginUser(req.body);
    sendResponse(res, 200, 'Login successful', { user });
});

// Get user by ID
export const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    sendResponse(res, 200, 'User details', { user });
});

// Get all staff members
export const getStaffMembers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const staff = await userService.getStaffMembers();
    sendResponse(res, 200, 'Staff members list', { staff });
});

