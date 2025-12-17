"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffMembers = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
// Register new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, contact_info } = req.body;
        // Validation
        if (!name || !email || !password || !role) {
            res.status(400).json({ message: 'Name, email, password, and role are required' });
            return;
        }
        // Validate role
        if (!['User', 'Staff', 'Admin'].includes(role)) {
            res.status(400).json({ message: 'Role must be User, Staff, or Admin' });
            return;
        }
        // Check if email exists
        const [existingUsers] = await database_1.default.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            res.status(409).json({ message: 'Email already registered' });
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Insert user
        const [result] = await database_1.default.execute('INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, role, contact_info || null]);
        const userResponse = {
            id: result.insertId,
            name,
            email,
            role,
            contact_info
        };
        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.registerUser = registerUser;
// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        // Find user
        const [users] = await database_1.default.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const user = users[0];
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            contact_info: user.contact_info,
            created_at: user.created_at
        };
        res.status(200).json({ message: 'Login successful', user: userResponse });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.loginUser = loginUser;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await database_1.default.execute('SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user: users[0] });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserById = getUserById;
// Get all staff members
const getStaffMembers = async (req, res) => {
    try {
        const [staff] = await database_1.default.execute('SELECT id, name, email, contact_info FROM users WHERE role = ?', ['Staff']);
        res.status(200).json({ staff });
    }
    catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getStaffMembers = getStaffMembers;
//# sourceMappingURL=userController.js.map