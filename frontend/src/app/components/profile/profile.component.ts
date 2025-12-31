import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint } from '../../models/complaint.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    user: any;
    loading = true;
    complaints: Complaint[] = [];
    recentComplaints: Complaint[] = [];

    stats = {
        total: 0,
        open: 0,
        resolved: 0
    };

    // Admin properties
    adminStats: any = {};
    userList: any[] = [];
    userColumns: string[] = ['name', 'email', 'role', 'actions'];

    constructor(
        public authService: AuthService,
        private complaintService: ComplaintService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.user = this.authService.currentUser;
        if (this.user) {
            this.loadComplaintData();
        } else {
            this.router.navigate(['/login']);
        }
    }

    loadComplaintData(): void {
        this.loading = true;

        if (this.user.role === 'Admin') {
            // Load global stats
            this.complaintService.getStats().subscribe({
                next: (data) => {
                    this.adminStats = data;
                    // Calculate In-Progress
                    // Total - Resolved = Active. Active includes Open & In-Progress.
                    // We can't strictly separate without specific backend breakdown, but let's assume active = (Open + In-Progress)
                    this.adminStats.open = data.byStatus.find((s: any) => s.status === 'Open')?.count || 0;
                    this.adminStats.inProgress = data.byStatus.find((s: any) => s.status === 'In-progress')?.count || 0;
                    this.adminStats.resolved = data.resolved;
                    this.adminStats.total = data.total;

                    // Get all users
                    this.loadUserList();
                },
                error: (err) => {
                    console.error('Error loading admin stats', err);
                    this.loading = false;
                }
            });
            return;
        }

        // Determine query params based on role
        const params: any = {};
        if (this.user.role === 'Staff') {
            params.staff_id = this.user.id;
            params.role = 'Staff';
        } else if (this.user.role === 'User') {
            params.user_id = this.user.id;
            params.role = 'User';
        }

        this.complaintService.getComplaints(params).subscribe({
            next: (res) => {
                this.complaints = res.complaints;
                this.calculateStats();

                // Sort descending by date
                this.complaints.sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                });

                this.recentComplaints = this.complaints.slice(0, 5);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading complaints', err);
                this.loading = false;
            }
        });
    }

    // Filter logic
    filterValue: string = '';
    filteredUserList: any[] = [];
    selectedRoleFilter: string = 'All';

    applyUserFilter(): void {
        let temp = this.userList;

        // Filter by Role
        if (this.selectedRoleFilter !== 'All') {
            temp = temp.filter(u => u.role === this.selectedRoleFilter);
        }

        // Filter by Name/Email
        if (this.filterValue) {
            const val = this.filterValue.toLowerCase();
            temp = temp.filter(u =>
                u.name.toLowerCase().includes(val) ||
                u.email.toLowerCase().includes(val)
            );
        }

        this.filteredUserList = temp;
    }

    loadUserList(): void {
        this.authService.getAllUsers().subscribe({
            next: (res) => {
                this.userList = res.users;
                // Default sort: Staff first, then Users
                this.userList.sort((a, b) => (a.role === 'Staff' ? -1 : 1));
                this.filteredUserList = [...this.userList];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading users', err);
                this.loading = false;
            }
        });
    }

    // Admin Actions
    toggleUserStatus(user: any): void {
        if (confirm(`Are you sure you want to ${user.isActive ? 'disable' : 'enable'} this account?`)) {
            // Mock API call
            console.log('Toggling user status:', user);
            // user.isActive = !user.isActive; // Toggle locally for demo
        }
    }

    removeUser(user: any): void {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            console.log('Deleting user:', user);
            // In real app: call service.deleteUser(user.id).subscribe(...)
            // For now, remove from local list
            this.userList = this.userList.filter(u => u.id !== user.id);
            this.applyUserFilter();
        }
    }

    changeUserRole(user: any): void {
        const newRole = user.role === 'Staff' ? 'User' : 'Staff';
        if (confirm(`Promote/Demote ${user.name} to ${newRole}?`)) {
            console.log('Changing role:', user);
            // Mock update
            user.role = newRole;
        }
    }

    calculateStats(): void {
        this.stats.total = this.complaints.length;
        this.stats.resolved = this.complaints.filter(c => c.status === 'Resolved').length;

        if (this.user.role === 'Staff') {
            this.stats.open = this.complaints.filter(c => c.status !== 'Resolved').length;
        } else {
            this.stats.open = this.stats.total - this.stats.resolved;
        }
    }

    // Edit Profile Logic
    isEditing = false;
    editData: any = {};
    newSkill: string = '';

    toggleEditMode(): void {
        this.isEditing = !this.isEditing;
        if (this.isEditing) {
            this.editData = JSON.parse(JSON.stringify(this.user)); // Deep copy
            if (this.user.role === 'Staff' && !this.editData.skills) {
                this.editData.skills = [];
            }
        }
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.editData = {};
    }

    saveProfile(): void {
        this.loading = true;
        this.authService.updateUser(this.user.id, this.editData).subscribe({
            next: (res) => {
                this.user = res.user; // Update local user
                this.isEditing = false;
                this.loading = false;
            },
            error: (err) => {
                console.error('Update failed', err);
                this.loading = false;
                alert('Failed to update profile');
            }
        });
    }

    // Skill Management
    availableSkills: string[] = [
        'Plumbing',
        'Electrical',
        'Carpentry',
        'Cleaning',
        'Pest Control',
        'Appliance Repair',
        'Painting',
        'Gardening',
        'Security',
        'Internet/Network'
    ];
    selectedSkill: string = '';
    showOtherSkillInput: boolean = false;

    onSkillSelect(skill: string): void {
        if (skill === 'Other') {
            this.showOtherSkillInput = true;
            this.newSkill = '';
        } else {
            this.showOtherSkillInput = false;
            this.selectedSkill = skill;
            this.addSkill(skill);
        }
    }

    addSkill(skillToAdd?: string): void {
        const skill = skillToAdd || this.newSkill;

        if (skill && skill.trim()) {
            if (!this.editData.skills) this.editData.skills = [];

            // Prevent duplicates
            const normalizedSkill = skill.trim();
            if (!this.editData.skills.includes(normalizedSkill)) {
                this.editData.skills.push(normalizedSkill);
            }

            // Reset fields
            this.newSkill = '';
            this.selectedSkill = '';
            this.showOtherSkillInput = false;
        }
    }

    removeSkill(index: number): void {
        if (this.editData.skills) {
            this.editData.skills.splice(index, 1);
        }
    }

    getStaffSkills(): string[] {
        if (this.user && this.user.skills && this.user.skills.length > 0) {
            return this.user.skills;
        }
        return [];
    }

    getInitials(name: string): string {
        return name ? name.substring(0, 2).toUpperCase() : 'U';
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
