import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { ComplaintListComponent } from './components/complaint-list/complaint-list.component';
import { NewComplaintComponent } from './components/new-complaint/new-complaint.component';
import { ComplaintDetailsComponent } from './components/complaint-details/complaint-details.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  // Public Routes
  { path: '', component: HomeComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },

  // User Routes (Protected)
  {
    path: 'complaints',
    component: ComplaintListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'complaints/new',
    component: NewComplaintComponent,
    canActivate: [AuthGuard],
    data: { roles: ['User'] }
  },
  {
    path: 'complaints/:id',
    component: ComplaintDetailsComponent,
    canActivate: [AuthGuard]
  },

  // Staff Routes (Role Protected)
  {
    path: 'staff/dashboard',
    component: StaffDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Staff'] }
  },

  // Admin Routes (Role Protected - Optional)
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },

  // Wildcard Route
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
