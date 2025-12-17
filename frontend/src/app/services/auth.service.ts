import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    register(userData: UserRegistration): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
    }

    login(credentials: UserLogin): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                this.currentUserSubject.next(response.user);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
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
        return this.http.get<{ staff: User[] }>(`${this.apiUrl}/staff`);
    }
}
