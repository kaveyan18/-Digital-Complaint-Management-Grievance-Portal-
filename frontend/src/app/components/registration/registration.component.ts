import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
    registrationForm: FormGroup;
    hidePassword = true;
    loading = false;
    errorMessage = '';
    successMessage = '';

    roles = [
        { value: 'User', label: 'User ' },
        { value: 'Staff', label: 'Staff' }
    ];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registrationForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['User', Validators.required],
            contact_info: ['']
        });
    }

    onSubmit(): void {
        if (this.registrationForm.invalid) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.register(this.registrationForm.value).subscribe({
            next: (response) => {
                this.loading = false;
                this.successMessage = response.message;
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 1500);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
            }
        });
    }
}
