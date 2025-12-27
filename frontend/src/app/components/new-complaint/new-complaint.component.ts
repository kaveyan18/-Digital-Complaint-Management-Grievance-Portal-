import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-new-complaint',
    templateUrl: './new-complaint.component.html',
    styleUrls: ['./new-complaint.component.css']
})
export class NewComplaintComponent {
    complaintForm: FormGroup;
    loading = false;
    errorMessage = '';
    successMessage = '';

    categories = [
        { value: 'plumbing', label: 'Plumbing', icon: 'plumbing' },
        { value: 'electrical', label: 'Electrical', icon: 'electrical_services' },
        { value: 'facility', label: 'Facility', icon: 'business' },
        { value: 'other', label: 'Other', icon: 'help_outline' }
    ];

    selectedFile: File | null = null;

    constructor(
        private fb: FormBuilder,
        private complaintService: ComplaintService,
        private authService: AuthService,
        private notificationService: NotificationService,
        private router: Router
    ) {
        this.complaintForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(5)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            category: ['', Validators.required],
            attachments: ['']
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    onSubmit(): void {
        if (this.complaintForm.invalid) {
            return;
        }

        const user = this.authService.currentUser;
        if (!user?.id) {
            this.errorMessage = 'Please log in to submit a complaint';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const formData = new FormData();
        formData.append('user_id', user.id.toString());
        formData.append('title', this.complaintForm.get('title')?.value);
        formData.append('description', this.complaintForm.get('description')?.value);
        formData.append('category', this.complaintForm.get('category')?.value);

        if (this.selectedFile) {
            formData.append('attachment', this.selectedFile);
        }

        this.complaintService.createComplaint(formData).subscribe({
            next: (response) => {
                this.loading = false;
                const trackingId = response.data.complaint.complaint_unique_id || response.data.complaint.id;
                this.successMessage = `Complaint submitted successfully! Tracking ID: ${trackingId}`;
                this.notificationService.showSuccess('Complaint submitted successfully!');
                setTimeout(() => {
                    this.router.navigate(['/complaints']);
                }, 3000);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to submit complaint. Please try again.';
            }
        });
    }
}
