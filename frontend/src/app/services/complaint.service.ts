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

    // Create new complaint
    createComplaint(complaint: ComplaintCreate): Observable<{ message: string; complaint: Complaint }> {
        return this.http.post<any>(this.apiUrl, complaint).pipe(
            map(response => ({
                message: response.message,
                complaint: response.data.complaint
            }))
        );
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

    // Update complaint
    updateComplaint(id: number, update: ComplaintUpdate): Observable<{ message: string; complaint: Complaint }> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, update).pipe(
            map(response => ({
                message: response.message,
                complaint: response.data.complaint
            }))
        );
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
}
