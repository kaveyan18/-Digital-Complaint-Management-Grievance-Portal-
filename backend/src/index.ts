import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { testConnection } from './config/database';
import userRoutes from './routes/userRoutes';
import complaintRoutes from './routes/complaintRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { startSLAJob } from './services/schedulerService';

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

import { apiLimiter } from './middleware/rateLimiter';
app.use('/api', apiLimiter);

// Serve uploaded files
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('Failed to connect to database. Please check your MySQL configuration.');
            console.log('Server will start but database operations will fail.');
        } else {
            // Start Scheduler
            startSLAJob();
        }

        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║     Digital Complaint Management Portal - Backend API      ║
╠════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                   ║
║  API Base URL: http://localhost:${PORT}/api                    ║
╠════════════════════════════════════════════════════════════╣
║  Available Endpoints:                                      ║
║  - POST   /api/users/register    (Register user)           ║
║  - POST   /api/users/login       (Login user)              ║
║  - GET    /api/users/staff       (Get staff list)          ║
║  - GET    /api/users/:id         (Get user by ID)          ║
║  - POST   /api/complaints        (Create complaint)        ║
║  - GET    /api/complaints        (List complaints)         ║
║  - GET    /api/complaints/:id    (Get complaint details)   ║
║  - PUT    /api/complaints/:id    (Update complaint)        ║
║  - DELETE /api/complaints/:id    (Delete complaint)        ║
║  - GET    /api/complaints/stats  (Get statistics)          ║
║  - GET    /api/notifications/:uid(List notifications)      ║
╚════════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
