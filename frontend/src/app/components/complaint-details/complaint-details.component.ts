import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Complaint } from '../../models/complaint.model';

@Component({
    selector: 'app-complaint-details',
    templateUrl: './complaint-details.component.html',
    styleUrls: ['./complaint-details.component.css']
})
export class ComplaintDetailsComponent implements OnInit {
    complaint: Complaint | null = null;
    loading = true;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private complaintService: ComplaintService,
        public authService: AuthService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadComplaint(+id);
        }
    }

    loadComplaint(id: number): void {
        this.complaintService.getComplaintById(id).subscribe({
            next: (response) => {
                this.complaint = response.complaint;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to load complaint details';
            }
        });
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

    goBack(): void {
        const role = this.authService.userRole;
        if (role === 'Staff') {
            this.router.navigate(['/staff/dashboard']);
        } else {
            this.router.navigate(['/complaints']);
        }
    }
}
