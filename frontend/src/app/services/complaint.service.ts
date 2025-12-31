import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Complaint, ComplaintCreate, ComplaintUpdate, ComplaintStats } from '../models/complaint.model';

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {
    private apiUrl = 'http://localhost:3000/api/complaints';

    constructor(private http: HttpClient) { }

    // Create a new complaint
    createComplaint(complaintData: any): Observable<any> {
        // Now accepts FormData for file uploads
        return this.http.post<any>(this.apiUrl, complaintData);
    }

    // Get all complaints (with optional filters)
    getComplaints(params?: { user_id?: number; role?: string; staff_id?: number }): Observable<{ complaints: Complaint[] }> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.user_id) httpParams = httpParams.set('user_id', params.user_id.toString());
            if (params.role) httpParams = httpParams.set('role', params.role);
            if (params.staff_id) httpParams = httpParams.set('staff_id', params.staff_id.toString());
        }
        return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
            map(response => ({
                complaints: response.data.complaints
            }))
        );
    }

    // Get complaint by ID
    getComplaintById(id: number): Observable<{ complaint: Complaint }> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => ({
                complaint: response.data.complaint
            }))
        );
    }

    // Track complaint by unique ID
    trackComplaint(uniqueId: string, userId: number): Observable<{ complaint: Complaint }> {
        let httpParams = new HttpParams().set('userId', userId.toString());
        return this.http.get<any>(`${this.apiUrl}/track/${uniqueId}`, { params: httpParams }).pipe(
            map(response => ({
                complaint: response.data.complaint
            }))
        );
    }

    // Update complaint status/staff/notes
    updateComplaint(id: number, updateData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, updateData);
    }

    // Delete complaint
    deleteComplaint(id: number): Observable<{ message: string }> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => ({
                message: response.message
            }))
        );
    }

    // Get statistics (admin)
    getStats(): Observable<ComplaintStats> {
        return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
            map(response => response.data)
        );
    }

    // Submit feedback
    submitFeedback(id: number, rating: number, feedback: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/feedback`, { rating, feedback });
    }

    // Get complaint history logs
    getComplaintLogs(id: number): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/${id}/logs`).pipe(
            map(response => response.data.logs)
        );
    }
}
