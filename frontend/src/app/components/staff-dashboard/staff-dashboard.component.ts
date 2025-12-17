import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Complaint, ComplaintUpdate } from '../../models/complaint.model';

@Component({
    selector: 'app-staff-dashboard',
    templateUrl: './staff-dashboard.component.html',
    styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit {
    complaints: Complaint[] = [];
    loading = true;
    errorMessage = '';
    successMessage = '';
    displayedColumns = ['id', 'title', 'category', 'user_name', 'status', 'created_at', 'actions'];

    statusOptions = ['Assigned', 'In-progress', 'Resolved'];

    constructor(
        private complaintService: ComplaintService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadAssignedComplaints();
    }

    loadAssignedComplaints(): void {
        this.loading = true;
        const user = this.authService.currentUser;

        if (!user || user.role !== 'Staff') {
            this.router.navigate(['/login']);
            return;
        }

        const params = {
            staff_id: user.id,
            role: 'Staff'
        };

        this.complaintService.getComplaints(params).subscribe({
            next: (response) => {
                this.complaints = response.complaints;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to load assigned complaints';
            }
        });
    }

    updateStatus(complaint: Complaint, newStatus: string): void {
        if (!complaint.id) return;

        const update: ComplaintUpdate = { status: newStatus as any };

        this.complaintService.updateComplaint(complaint.id, update).subscribe({
            next: (response) => {
                this.successMessage = `Status updated to ${newStatus}`;
                complaint.status = newStatus as any;
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Failed to update status';
                setTimeout(() => this.errorMessage = '', 3000);
            }
        });
    }

    addResolutionNote(complaint: Complaint): void {
        const note = prompt('Enter resolution notes:');
        if (note && complaint.id) {
            const update: ComplaintUpdate = { resolution_notes: note };
            this.complaintService.updateComplaint(complaint.id, update).subscribe({
                next: () => {
                    this.successMessage = 'Resolution notes added';
                    complaint.resolution_notes = note;
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    this.errorMessage = error.error?.message || 'Failed to add notes';
                }
            });
        }
    }

    viewDetails(id: number): void {
        this.router.navigate(['/complaints', id]);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Open': return 'status-open';
            case 'Assigned': return 'status-assigned';
            case 'In-progress': return 'status-progress';
            case 'Resolved': return 'status-resolved';
            default: return '';
        }
    }
}
