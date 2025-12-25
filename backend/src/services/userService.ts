import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { UserRegistration, UserLogin, UserResponse, User } from '../models/User';
import { AppError } from '../utils/AppError';

export class UserService {
    async registerUser(userData: UserRegistration): Promise<UserResponse> {
        const { name, email, password, role, contact_info } = userData;

        // Check if email exists
        const [existingUsers] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            throw new AppError('Email already registered', 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, contact_info || null]
        );

        return {
            id: result.insertId,
            name,
            email,
            role,
            contact_info
        };
    }

    async loginUser(loginData: UserLogin): Promise<UserResponse> {
        const { email, password } = loginData;

        // Find user
        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new AppError('Invalid email or password', 401);
        }

        const user = users[0] as User;

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError('Invalid email or password', 401);
        }

        return {
            id: user.id!,
            name: user.name,
            email: user.email,
            role: user.role,
            contact_info: user.contact_info,
            created_at: user.created_at
        };
    }

    async getUserById(id: string): Promise<User> {
        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            throw new AppError('User not found', 404);
        }

        return users[0] as User;
    }

    async getStaffMembers(): Promise<User[]> {
        const [staff] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, contact_info FROM users WHERE role = ?',
            ['Staff']
        );
        return staff as User[];
    }
}
