import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Complaint, ComplaintUpdate } from '../../models/complaint.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ResolutionDialogComponent } from '../resolution-dialog/resolution-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-staff-dashboard',
    templateUrl: './staff-dashboard.component.html',
    styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit, AfterViewInit {
    // ... (existing properties)
    dataSource: MatTableDataSource<Complaint>;
    complaints: Complaint[] = [];
    loading = true;
    errorMessage = '';
    successMessage = '';
    displayedColumns = ['id', 'title', 'category', 'user_name', 'status', 'created_at', 'actions'];
    statusOptions = ['Assigned', 'In-progress', 'Resolved'];
    filterStatus = 'All';

    // Stats
    totalAssigned = 0;
    pendingCount = 0;
    inProgressCount = 0;
    resolvedCount = 0;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private complaintService: ComplaintService,
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog,
        private notificationService: NotificationService
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadAssignedComplaints();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    // ... (loadAssignedComplaints, applyStatusFilter, calculateStats, updateStatus methods remain same)

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
                const complaintsData = response.complaints;
                this.complaints = complaintsData;
                this.dataSource.data = complaintsData;
                this.calculateStats();
                this.loading = false;
                this.applyStatusFilter();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to load assigned complaints';
            }
        });
    }

    applyStatusFilter(): void {
        if (this.filterStatus === 'All') {
            this.dataSource.filter = '';
        } else {
            this.dataSource.filter = this.filterStatus.trim().toLowerCase();
        }

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    calculateStats(): void {
        this.totalAssigned = this.complaints.length;
        this.pendingCount = this.complaints.filter(c => c.status === 'Open' || c.status === 'Assigned').length;
        this.inProgressCount = this.complaints.filter(c => c.status === 'In-progress').length;
        this.resolvedCount = this.complaints.filter(c => c.status === 'Resolved').length;
    }

    updateStatus(complaint: Complaint, newStatus: string): void {
        if (!complaint.id) return;

        const update: ComplaintUpdate = { status: newStatus as any };

        this.complaintService.updateComplaint(complaint.id, update).subscribe({
            next: (response) => {
                this.notificationService.showSuccess(`Status updated to ${newStatus}`);
                complaint.status = newStatus as any;
                this.calculateStats();
            },
            error: (error) => {
                this.notificationService.showError(error.error?.message || 'Failed to update status');
            }
        });
    }

    openResolutionDialog(complaint: Complaint): void {
        const dialogRef = this.dialog.open(ResolutionDialogComponent, {
            width: '600px',
            data: { previousNotes: complaint.resolution_notes }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && complaint.id) {
                // Append new note to existing notes
                const updatedNotes = (complaint.resolution_notes || '') + '\n' + result;

                const update: ComplaintUpdate = { resolution_notes: updatedNotes };

                this.complaintService.updateComplaint(complaint.id, update).subscribe({
                    next: () => {
                        this.notificationService.showSuccess('Resolution notes added');
                        complaint.resolution_notes = updatedNotes;
                    },
                    error: (error) => {
                        this.notificationService.showError(error.error?.message || 'Failed to add notes');
                    }
                });
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

    isTransitionValid(currentStatus: string, nextStatus: string): boolean {
        if (currentStatus === nextStatus) return true;
        if (currentStatus === 'Assigned' && nextStatus === 'In-progress') return true;
        if (currentStatus === 'In-progress' && nextStatus === 'Resolved') return true;
        return false;
    }
}
