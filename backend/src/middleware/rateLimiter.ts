import rateLimit from 'express-rate-limit';

// General API rate limiter
// 100 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

// Stricter limiter for Auth routes (Login/Register)
// 10 attempts per 15 minutes to prevent brute-force
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many login/register attempts from this IP, please try again after 15 minutes'
    }
});
