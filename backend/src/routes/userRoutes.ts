import { Router } from 'express';
import {
    registerUser,
    loginUser,
    getUserById,
    getStaffMembers,
    getAllUsers,
    updateUserProfile
} from '../controllers/userController';

const router = Router();

// POST /api/users/register - Register new user with role selection
router.post('/register', registerUser);

// POST /api/users/login - Login user
router.post('/login', loginUser);

// GET /api/users - Get all users (Admin)
router.get('/', getAllUsers);

// GET /api/users/staff - Get all staff members
router.get('/staff', getStaffMembers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user profile
router.put('/:id', updateUserProfile);

export default router;
