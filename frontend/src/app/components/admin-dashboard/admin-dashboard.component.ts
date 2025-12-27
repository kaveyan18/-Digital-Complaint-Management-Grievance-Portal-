import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Complaint, ComplaintUpdate, ComplaintStats } from '../../models/complaint.model';
import { User } from '../../models/user.model';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    complaints: Complaint[] = [];
    staffMembers: User[] = [];
    stats: ComplaintStats | null = null;
    loading = true;
    errorMessage = '';
    successMessage = '';
    displayedColumns = ['id', 'title', 'category', 'user_name', 'status', 'staff_name', 'actions'];

    constructor(
        private complaintService: ComplaintService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;

        // Load all complaints
        this.complaintService.getComplaints().subscribe({
            next: (response) => {
                this.complaints = response.complaints;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to load complaints';
            }
        });

        // Load stats
        this.complaintService.getStats().subscribe({
            next: (stats) => {
                this.stats = stats;
            },
            error: () => { } // Stats are optional
        });

        // Load staff members
        this.authService.getStaffMembers().subscribe({
            next: (response) => this.staffMembers = response.staff,
            error: () => { }
        });
    }

    assignStaff(complaint: Complaint, staffId: number): void {
        if (!complaint.id) return;

        // ... rest of method
        const update: ComplaintUpdate = { staff_id: staffId };

        this.complaintService.updateComplaint(complaint.id, update).subscribe({
            next: (response) => {
                this.successMessage = 'Complaint assigned successfully';
                complaint.staff_id = staffId;
                complaint.status = 'Assigned';
                const staff = this.staffMembers.find(s => s.id === staffId);
                if (staff) complaint.staff_name = staff.name;
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Failed to assign';
                setTimeout(() => this.errorMessage = '', 3000);
            }
        });
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
