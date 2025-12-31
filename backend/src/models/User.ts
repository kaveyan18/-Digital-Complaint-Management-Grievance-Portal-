// User interface matching database schema
export interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Staff' | 'Admin';
    contact_info?: string;
    created_at?: Date;
    skills?: string; // Stored as JSON string in DB
}

// User registration request
export interface UserRegistration {
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Staff' | 'Admin';
    contact_info?: string;
}

// User login request
export interface UserLogin {
    email: string;
    password: string;
}

// User response (without password)
export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: 'User' | 'Staff' | 'Admin';
    contact_info?: string;
    created_at?: Date;
    skills?: string[]; // parsed array
}

export interface UserUpdate {
    name?: string;
    contact_info?: string;
    skills?: string[];
}
