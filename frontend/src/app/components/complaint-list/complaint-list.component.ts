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
    filteredComplaints: Complaint[] = [];
    loading = true;
    errorMessage = '';
    displayedColumns = ['id', 'title', 'category', 'status', 'created_at', 'actions'];

    // Filter values
    selectedStatus = 'all';
    selectedCategory = 'all';

    // Stats
    stats = {
        total: 0,
        pending: 0,
        resolved: 0
    };

    currentUser: any;

    constructor(
        private complaintService: ComplaintService,
        public authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUser;
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
                this.applyFilters();
                this.calculateStats();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to load complaints';
            }
        });
    }

    calculateStats(): void {
        this.stats.total = this.complaints.length;
        this.stats.pending = this.complaints.filter(c => c.status !== 'Resolved').length;
        this.stats.resolved = this.complaints.filter(c => c.status === 'Resolved').length;
    }

    applyFilters(): void {
        this.filteredComplaints = this.complaints.filter(c => {
            const statusMatch = this.selectedStatus === 'all' || c.status === this.selectedStatus;
            const categoryMatch = this.selectedCategory === 'all' || c.category === this.selectedCategory;
            return statusMatch && categoryMatch;
        });
    }

    onFilterChange(): void {
        this.applyFilters();
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
