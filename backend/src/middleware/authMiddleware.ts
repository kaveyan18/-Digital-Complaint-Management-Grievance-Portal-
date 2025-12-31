
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new AppError('No token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // @ts-ignore
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid token', 401));
    }
};
