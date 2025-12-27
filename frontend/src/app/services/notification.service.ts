import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Notification } from '../models/notification.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = 'http://localhost:3000/api/notifications';

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) { }

    showSuccess(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
    }

    showError(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }

    getNotifications(userId: number): Observable<{ notifications: Notification[], unreadCount: number }> {
        return this.http.get<any>(`${this.apiUrl}/${userId}`).pipe(
            map(response => ({
                notifications: response.data.notifications,
                unreadCount: response.data.unreadCount
            }))
        );
    }

    markAsRead(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/read`, {});
    }

    markAllAsRead(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/read-all`, { userId });
    }
}
