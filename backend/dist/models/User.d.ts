export interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Staff' | 'Admin';
    contact_info?: string;
    created_at?: Date;
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
export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: 'User' | 'Staff' | 'Admin';
    contact_info?: string;
    created_at?: Date;
}
//# sourceMappingURL=User.d.ts.map