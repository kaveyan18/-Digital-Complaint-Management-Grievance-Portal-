import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { ComplaintStats } from '../../models/complaint.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    stats: ComplaintStats | null = null;

    constructor(private complaintService: ComplaintService) { }

    ngOnInit(): void {
        this.loadStats();
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
