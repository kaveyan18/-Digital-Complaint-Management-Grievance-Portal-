import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { filter } from 'rxjs/operators';
import { NotificationService } from './services/notification.service';
import { Notification } from './models/notification.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './styles-footer.css']
})
export class AppComponent implements OnInit {
  title = 'ResolveDesk';
  isMobileMenuOpen = false;
  isScrolled = false;

  unreadCount = 0;
  notifications: Notification[] = [];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobileMenuOpen = false;
    });

    // Check notifications every 30 seconds if logged in
    this.checkNotifications();
    setInterval(() => this.checkNotifications(), 30000);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  checkNotifications(): void {
    const user = this.authService.currentUser;
    if (user && user.id) {
      this.notificationService.getNotifications(user.id).subscribe({
        next: (res) => {
          this.notifications = res.notifications;
          this.unreadCount = res.unreadCount;
        }
      });
    }
  }

  markAllRead(): void {
    const user = this.authService.currentUser;
    if (user && user.id) {
      this.notificationService.markAllAsRead(user.id).subscribe(() => {
        this.unreadCount = 0;
        this.notifications.forEach(n => n.is_read = true);
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToDashboard(): void {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/']);
      return;
    }

    const role = this.authService.userRole;
    if (role === 'Staff') {
      this.router.navigate(['/staff/dashboard']);
    } else if (role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/track-complaint']);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
