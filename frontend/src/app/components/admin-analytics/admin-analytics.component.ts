import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { ComplaintStats } from '../../models/complaint.model';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  stats: ComplaintStats | null = null;
  loading = true;

  // Charts Data
  categoryData: any[] = [];
  staffPerformanceData: any[] = [];
  statusData: any[] = [];

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  };

  constructor(private complaintService: ComplaintService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.complaintService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.processChartData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.loading = false;
      }
    });
  }

  processChartData(): void {
    if (!this.stats) return;

    // Process Category Data
    this.categoryData = this.stats.byCategory.map(item => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item.count
    }));

    // Process Status Data (Pie Chart)
    this.statusData = this.stats.byStatus.map(item => ({
      name: item.status,
      value: item.count
    }));

    // Process Staff Performance Data
    if (this.stats.staffPerformance) {
      this.staffPerformanceData = this.stats.staffPerformance.map(item => ({
        name: item.name,
        value: item.resolved_count
      }));
    }
  }
}
