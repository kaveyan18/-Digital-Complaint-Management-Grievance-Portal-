import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { User, UserRegistration, UserLogin, AuthResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/users';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Check localStorage for existing user
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && storedUser !== 'undefined') {
            try {
                this.currentUserSubject.next(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('currentUser');
                this.currentUserSubject.next(null);
            }
        }
    }

    register(userData: UserRegistration): Observable<AuthResponse> {
        return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
            map(response => {
                return {
                    message: response.message,
                    user: response.data.user,
                    token: response.data.token
                };
            }),
            tap(response => {
                if (response && response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    this.currentUserSubject.next(response.user);
                }
            })
        );
    }

    login(credentials: UserLogin): Observable<AuthResponse> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            map(response => {
                return {
                    message: response.message,
                    user: response.data.user,
                    token: response.data.token
                };
            }),
            tap(response => {
                if (response && response.user && response.token) {
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    localStorage.setItem('token', response.token);
                    this.currentUserSubject.next(response.user);
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    get userRole(): string | null {
        return this.currentUserSubject.value?.role || null;
    }

    getStaffMembers(): Observable<{ staff: User[] }> {
        return this.http.get<any>(`${this.apiUrl}/staff`).pipe(
            map(response => response.data)
        );
    }

    getAllUsers(): Observable<{ users: User[] }> {
        return this.http.get<any>(`${this.apiUrl}`).pipe(
            map(response => response.data)
        );
    }

    updateUser(id: number, data: any): Observable<{ user: User }> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
            map(response => {
                // Update local current user if it matches
                const current = this.currentUserSubject.value;
                if (current && current.id === id) {
                    const updated = { ...current, ...response.data.user };
                    localStorage.setItem('user', JSON.stringify(updated));
                    this.currentUserSubject.next(updated);
                }
                return response.data;
            })
        );
    }
}
