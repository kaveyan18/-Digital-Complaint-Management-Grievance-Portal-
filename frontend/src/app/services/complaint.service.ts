import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint, ComplaintCreate, ComplaintUpdate, ComplaintStats } from '../models/complaint.model';

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {
    private apiUrl = 'http://localhost:3000/api/complaints';

    constructor(private http: HttpClient) { }

    // Create new complaint
    createComplaint(complaint: ComplaintCreate): Observable<{ message: string; complaint: Complaint }> {
        return this.http.post<{ message: string; complaint: Complaint }>(this.apiUrl, complaint);
    }

    // Get all complaints (with optional filters)
    getComplaints(params?: { user_id?: number; role?: string; staff_id?: number }): Observable<{ complaints: Complaint[] }> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.user_id) httpParams = httpParams.set('user_id', params.user_id.toString());
            if (params.role) httpParams = httpParams.set('role', params.role);
            if (params.staff_id) httpParams = httpParams.set('staff_id', params.staff_id.toString());
        }
        return this.http.get<{ complaints: Complaint[] }>(this.apiUrl, { params: httpParams });
    }

    // Get complaint by ID
    getComplaintById(id: number): Observable<{ complaint: Complaint }> {
        return this.http.get<{ complaint: Complaint }>(`${this.apiUrl}/${id}`);
    }

    // Update complaint
    updateComplaint(id: number, update: ComplaintUpdate): Observable<{ message: string; complaint: Complaint }> {
        return this.http.put<{ message: string; complaint: Complaint }>(`${this.apiUrl}/${id}`, update);
    }

    // Delete complaint
    deleteComplaint(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }

    // Get statistics (admin)
    getStats(): Observable<ComplaintStats> {
        return this.http.get<ComplaintStats>(`${this.apiUrl}/stats`);
    }
}
