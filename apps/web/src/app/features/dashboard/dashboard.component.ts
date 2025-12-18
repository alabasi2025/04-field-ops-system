import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { OperationsService, Operation } from '../../core/services/operations.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">لوحة التحكم</h2>
        <p-button label="تحديث" icon="pi pi-refresh" [outlined]="true" (click)="loadData()" />
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats(); track stat.label) {
          <p-card styleClass="shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm">{{ stat.label }}</p>
                <p class="text-3xl font-bold" [class]="stat.color">{{ stat.value }}</p>
              </div>
              <div class="w-12 h-12 rounded-full flex items-center justify-center" [class]="stat.bgColor">
                <i [class]="stat.icon + ' text-xl ' + stat.color"></i>
              </div>
            </div>
          </p-card>
        }
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Operations by Status -->
        <p-card header="العمليات حسب الحالة" styleClass="shadow-sm">
          <p-chart type="doughnut" [data]="statusChartData()" [options]="chartOptions" />
        </p-card>

        <!-- Operations by Type -->
        <p-card header="العمليات حسب النوع" styleClass="shadow-sm">
          <p-chart type="bar" [data]="typeChartData()" [options]="barChartOptions" />
        </p-card>
      </div>

      <!-- Recent Operations -->
      <p-card header="أحدث العمليات" styleClass="shadow-sm">
        <p-table 
          [value]="recentOperations()" 
          [loading]="loading()"
          styleClass="p-datatable-sm"
          [rows]="5"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>رقم العملية</th>
              <th>النوع</th>
              <th>العنوان</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-op>
            <tr>
              <td class="font-mono">{{ op.operation_number }}</td>
              <td>
                <p-tag [value]="getTypeLabel(op.operation_type)" [severity]="getTypeSeverity(op.operation_type)" />
              </td>
              <td>{{ op.title }}</td>
              <td>
                <p-tag [value]="getStatusLabel(op.status)" [severity]="getStatusSeverity(op.status)" />
              </td>
              <td>{{ op.created_at | date:'short' }}</td>
              <td>
                <p-button 
                  icon="pi pi-eye" 
                  [text]="true" 
                  [routerLink]="['/operations', op.id]"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8 text-gray-500">
                لا توجد عمليات
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly operationsService = inject(OperationsService);

  loading = signal(true);
  stats = signal<any[]>([]);
  recentOperations = signal<Operation[]>([]);
  statusChartData = signal<any>({});
  typeChartData = signal<any>({});

  chartOptions = {
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  barChartOptions = {
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Load statistics
    this.operationsService.getStatistics().subscribe({
      next: (data) => {
        this.stats.set([
          { label: 'إجمالي العمليات', value: data.total, icon: 'pi pi-briefcase', color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'قيد التنفيذ', value: data.byStatus?.in_progress || 0, icon: 'pi pi-spinner', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
          { label: 'مكتملة', value: data.byStatus?.completed || 0, icon: 'pi pi-check', color: 'text-green-600', bgColor: 'bg-green-100' },
          { label: 'معلقة', value: data.byStatus?.on_hold || 0, icon: 'pi pi-pause', color: 'text-red-600', bgColor: 'bg-red-100' },
        ]);

        // Status chart
        this.statusChartData.set({
          labels: ['مسودة', 'مجدولة', 'قيد التنفيذ', 'مكتملة', 'ملغاة'],
          datasets: [{
            data: [
              data.byStatus?.draft || 0,
              data.byStatus?.scheduled || 0,
              data.byStatus?.in_progress || 0,
              data.byStatus?.completed || 0,
              data.byStatus?.cancelled || 0,
            ],
            backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444']
          }]
        });

        // Type chart
        this.typeChartData.set({
          labels: ['تركيب', 'صيانة', 'فحص', 'قراءة', 'تحصيل'],
          datasets: [{
            data: [
              data.byType?.installation || 0,
              data.byType?.maintenance || 0,
              data.byType?.inspection || 0,
              data.byType?.meter_reading || 0,
              data.byType?.collection || 0,
            ],
            backgroundColor: '#3b82f6'
          }]
        });
      }
    });

    // Load recent operations
    this.operationsService.getAll({ limit: 5 }).subscribe({
      next: (response) => {
        this.recentOperations.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      installation: 'تركيب',
      maintenance: 'صيانة',
      inspection: 'فحص',
      disconnection: 'فصل',
      reconnection: 'إعادة توصيل',
      meter_reading: 'قراءة',
      collection: 'تحصيل',
      migration: 'ترحيل',
      replacement: 'استبدال',
    };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, any> = {
      installation: 'success',
      maintenance: 'warn',
      inspection: 'info',
      disconnection: 'danger',
      reconnection: 'success',
      meter_reading: 'info',
      collection: 'warn',
    };
    return severities[type] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      scheduled: 'مجدولة',
      assigned: 'معينة',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتملة',
      cancelled: 'ملغاة',
      on_hold: 'معلقة',
      rejected: 'مرفوضة',
      approved: 'معتمدة',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, any> = {
      draft: 'secondary',
      scheduled: 'info',
      assigned: 'info',
      in_progress: 'warn',
      completed: 'success',
      cancelled: 'danger',
      on_hold: 'warn',
      rejected: 'danger',
      approved: 'success',
    };
    return severities[status] || 'secondary';
  }
}
