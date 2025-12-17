import { Router } from 'express';
import {
    registerUser,
    loginUser,
    getUserById,
    getStaffMembers
} from '../controllers/userController';

const router = Router();

// POST /api/users/register - Register new user with role selection
router.post('/register', registerUser);

// POST /api/users/login - Login user
router.post('/login', loginUser);

// GET /api/users/staff - Get all staff members
router.get('/staff', getStaffMembers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

export default router;
