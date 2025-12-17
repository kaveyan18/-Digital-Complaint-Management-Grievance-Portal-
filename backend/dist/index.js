"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const database_1 = require("./config/database");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const complaintRoutes_1 = __importDefault(require("./routes/complaintRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// API Routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/complaints', complaintRoutes_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
// Error handling
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            console.error('Failed to connect to database. Please check your MySQL configuration.');
            console.log('Server will start but database operations will fail.');
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
╚════════════════════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map