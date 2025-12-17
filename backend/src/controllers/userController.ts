import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { UserRegistration, UserLogin, UserResponse } from '../models/User';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Register new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, contact_info }: UserRegistration = req.body;

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
        const [existingUsers] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            res.status(409).json({ message: 'Email already registered' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, contact_info || null]
        );

        const userResponse: UserResponse = {
            id: result.insertId,
            name,
            email,
            role,
            contact_info
        };

        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: UserLogin = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        // Find user
        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const userResponse: UserResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            contact_info: user.contact_info,
            created_at: user.created_at
        };

        res.status(200).json({ message: 'Login successful', user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user: users[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all staff members
export const getStaffMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const [staff] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, contact_info FROM users WHERE role = ?',
            ['Staff']
        );

        res.status(200).json({ staff });
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
