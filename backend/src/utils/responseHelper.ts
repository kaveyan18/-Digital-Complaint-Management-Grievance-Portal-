import { Response } from 'express';

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
): void => {
    res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};
