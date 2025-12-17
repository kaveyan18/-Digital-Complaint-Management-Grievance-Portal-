import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const expectedRoles = route.data['roles'] as string[];
        const userRole = this.authService.userRole;

        if (!this.authService.isLoggedIn) {
            return this.router.createUrlTree(['/login']);
        }

        if (expectedRoles && userRole && expectedRoles.includes(userRole)) {
            return true;
        }

        // Redirect to not authorized or complaints page
        return this.router.createUrlTree(['/complaints']);
    }
}
