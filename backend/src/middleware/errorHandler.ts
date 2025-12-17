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
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

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
