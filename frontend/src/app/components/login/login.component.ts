import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;
    hidePassword = true;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: (response) => {
                this.loading = false;
                const role = response.user.role;

                // Redirect based on role
                if (role === 'Staff') {
                    this.router.navigate(['/staff/dashboard']);
                } else if (role === 'Admin') {
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    this.router.navigate(['/complaints']);
                }
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
            }
        });
    }
}
