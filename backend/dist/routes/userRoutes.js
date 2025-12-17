"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// POST /api/users/register - Register new user with role selection
router.post('/register', userController_1.registerUser);
// POST /api/users/login - Login user
router.post('/login', userController_1.loginUser);
// GET /api/users/staff - Get all staff members
router.get('/staff', userController_1.getStaffMembers);
// GET /api/users/:id - Get user by ID
router.get('/:id', userController_1.getUserById);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map