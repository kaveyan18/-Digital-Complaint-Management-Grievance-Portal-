import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Complaint } from '../../models/complaint.model';

@Component({
    selector: 'app-complaint-list',
    templateUrl: './complaint-list.component.html',
    styleUrls: ['./complaint-list.component.css']
})
export class ComplaintListComponent implements OnInit {
    complaints: Complaint[] = [];
    loading = true;
    errorMessage = '';
    displayedColumns = ['id', 'title', 'category', 'status', 'created_at', 'actions'];

    constructor(
        private complaintService: ComplaintService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadComplaints();
    }

    loadComplaints(): void {
        this.loading = true;
        const user = this.authService.currentUser;

        if (!user) {
            this.router.navigate(['/login']);
            return;
        }

        const params = {
            user_id: user.id,
            role: user.role
        };

        this.complaintService.getComplaints(params).subscribe({
            next: (response) => {
                this.complaints = response.complaints;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to load complaints';
            }
        });
    }

    viewComplaint(id: number): void {
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

    getCategoryIcon(category: string): string {
        switch (category) {
            case 'plumbing': return 'plumbing';
            case 'electrical': return 'electrical_services';
            case 'facility': return 'business';
            default: return 'help_outline';
        }
    }
}
