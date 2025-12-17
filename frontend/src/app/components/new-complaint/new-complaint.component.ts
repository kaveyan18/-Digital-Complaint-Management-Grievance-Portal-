import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';

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

    constructor(
        private fb: FormBuilder,
        private complaintService: ComplaintService,
        private authService: AuthService,
        private router: Router
    ) {
        this.complaintForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(5)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            category: ['', Validators.required],
            attachments: ['']
        });
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

        const complaintData = {
            ...this.complaintForm.value,
            user_id: user.id
        };

        this.complaintService.createComplaint(complaintData).subscribe({
            next: (response) => {
                this.loading = false;
                this.successMessage = response.message;
                setTimeout(() => {
                    this.router.navigate(['/complaints']);
                }, 1500);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to submit complaint. Please try again.';
            }
        });
    }
}
