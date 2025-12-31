import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { UserRegistration, UserLogin, UserResponse, User, UserUpdate } from '../models/User';
import { AppError } from '../utils/AppError';

export class UserService {
    // ...

    private generateToken(id: number, role: string): string {
        return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d'
        });
    }

    private parseSkills(skillsStr?: string): string[] {
        if (!skillsStr) return [];
        try {
            return JSON.parse(skillsStr);
        } catch (e) {
            return [];
        }
    }

    async registerUser(userData: UserRegistration): Promise<{ user: UserResponse, token: string }> {
        // ... (existing validation)
        const { name, email, password, role, contact_info } = userData;

        // Check if email exists
        const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            throw new AppError('Email already registered', 400);
        }

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
            [name, email, await bcrypt.hash(password, 10), role, contact_info || null]
        );

        const userId = result.insertId;
        const token = this.generateToken(userId, role);

        return {
            user: {
                id: userId,
                name,
                email,
                role,
                contact_info,
                skills: []
            },
            token
        };
    }

    async loginUser(loginData: UserLogin): Promise<{ user: UserResponse, token: string }> {
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

        const token = this.generateToken(user.id!, user.role);

        return {
            user: {
                id: user.id!,
                name: user.name,
                email: user.email,
                role: user.role,
                contact_info: user.contact_info,
                created_at: user.created_at,
                skills: this.parseSkills(user.skills)
            },
            token
        };
    }

    async getUserById(id: string): Promise<UserResponse> { // Changed return type to UserResponse to return parsed skills
        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, role, contact_info, created_at, skills FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            throw new AppError('User not found', 404);
        }

        const user = users[0] as User;
        return {
            id: user.id!,
            name: user.name,
            email: user.email,
            role: user.role,
            contact_info: user.contact_info,
            created_at: user.created_at,
            skills: this.parseSkills(user.skills)
        };
    }

    async updateUser(id: string, updateData: UserUpdate): Promise<UserResponse> {
        const { name, contact_info, skills } = updateData;
        const updates: string[] = [];
        const params: any[] = [];

        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        if (contact_info !== undefined) { // Allow clearing
            updates.push('contact_info = ?');
            params.push(contact_info);
        }
        if (skills) {
            updates.push('skills = ?');
            params.push(JSON.stringify(skills));
        }

        if (updates.length > 0) {
            params.push(id);
            await pool.execute<ResultSetHeader>(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }

        return this.getUserById(id);
    }

    async getStaffMembers(): Promise<User[]> {
        const [staff] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, contact_info, skills FROM users WHERE role = ?',
            ['Staff']
        );
        // Note: leaving as User[] here so internal might see string skills, but mostly used for dropdowns
        return staff as User[];
    }

    async getAllUsers(): Promise<User[]> {
        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, role, contact_info, created_at, skills FROM users ORDER BY created_at DESC'
        );
        return users as User[];
    }
}
