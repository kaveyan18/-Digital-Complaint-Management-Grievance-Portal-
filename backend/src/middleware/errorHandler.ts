import { Request, Response, NextFunction } from 'express';

// Error interface
interface CustomError extends Error {
    statusCode?: number;
}

// Global error handler middleware
export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Only log stack for 500 errors or non-operational errors
    if (statusCode >= 500) {
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
    } else {
        // Just log message for client errors
        console.warn(`Client Error (${statusCode}):`, err.message);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};
