import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Complaint } from '../../models/complaint.model';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-complaint-details',
    templateUrl: './complaint-details.component.html',
    styleUrls: ['./complaint-details.component.css']
})
export class ComplaintDetailsComponent implements OnInit {
    complaint: Complaint | null = null;
    loading = true;
    errorMessage = '';

    selectedStatus: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private complaintService: ComplaintService,
        public authService: AuthService,
        private notificationService: NotificationService
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
                if (this.complaint) {
                    // Initialize selectedStatus with current status or first valid option
                    this.selectedStatus = this.complaint.status;
                }
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to load complaint details';
            }
        });
    }

    getValidStatuses(): string[] {
        if (!this.complaint) return [];

        const current = this.complaint.status;
        const valid: string[] = [current]; // Always include current status

        if (current === 'Assigned') {
            valid.push('In-progress');
        } else if (current === 'In-progress') {
            valid.push('Resolved');
        }

        return valid;
    }

    updateStatus(): void {
        if (!this.complaint || !this.selectedStatus || this.selectedStatus === this.complaint.status) return;

        if (confirm(`Are you sure you want to update status to ${this.selectedStatus}?`)) {
            const update: any = { status: this.selectedStatus };

            this.complaintService.updateComplaint(this.complaint.id!, update).subscribe({
                next: () => {
                    if (this.complaint) {
                        this.complaint.status = this.selectedStatus as any;
                        this.notificationService.showSuccess('Status updated successfully');
                    }
                },
                error: (error) => {
                    this.notificationService.showError(error.error?.message || 'Failed to update status');
                }
            });
        }
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
