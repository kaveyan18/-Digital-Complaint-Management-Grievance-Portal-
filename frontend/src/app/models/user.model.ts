// User model matching backend
export interface User {
    id?: number;
    name: string;
    email: string;
    password?: string;
    role: 'User' | 'Staff' | 'Admin';
    contact_info?: string;
    created_at?: Date;
    skills?: string[];
}

export interface UserRegistration {
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Staff' | 'Admin';
    contact_info?: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token?: string;
}
