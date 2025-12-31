import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { ComplaintStats } from '../../models/complaint.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    stats: ComplaintStats | null = null;

    constructor(
        private complaintService: ComplaintService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadStats();
    }

    get isLoggedIn(): boolean {
        return this.authService.isLoggedIn;
    }

    loadStats(): void {
        this.complaintService.getStats().subscribe({
            next: (stats) => {
                this.stats = stats;
            },
            error: (err) => {
                console.error('Failed to load portal stats', err);
            }
        });
    }
}