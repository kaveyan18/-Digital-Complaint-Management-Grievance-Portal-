import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Digital Complaint Management Portal';
  isMobileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobileMenuOpen = false;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToDashboard(): void {
    const role = this.authService.userRole;
    if (role === 'Staff') {
      this.router.navigate(['/staff/dashboard']);
    } else if (role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/complaints']);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
