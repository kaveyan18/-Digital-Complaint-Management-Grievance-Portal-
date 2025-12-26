import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Complaint } from '../../models/complaint.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-track-complaint',
  templateUrl: './track-complaint.component.html',
  styleUrls: ['./track-complaint.component.css']
})
export class TrackComplaintComponent implements OnInit {
  complaintId: string = '';
  complaint: Complaint | null = null;
  loading = false;

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  trackComplaint(): void {
    if (!this.complaintId.trim()) return;

    const user = this.authService.currentUser;
    if (!user || user.id === undefined) {
      this.snackBar.open('You must be logged in to track complaints.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.complaint = null;

    this.complaintService.trackComplaint(this.complaintId.trim(), user.id).subscribe({
      next: (response) => {
        this.complaint = response.complaint;
        this.loading = false;
        this.snackBar.open('Complaint found successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error.error?.message || 'Complaint not found or unauthorized', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStepIndex(status: string): number {
    switch (status) {
      case 'Open': return 0;
      case 'Assigned': return 1;
      case 'In-progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
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
