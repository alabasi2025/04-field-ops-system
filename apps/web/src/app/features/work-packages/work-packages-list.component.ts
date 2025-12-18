import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-work-packages-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, CardModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">حزم العمل</h2>
        <p-button label="إنشاء حزمة" icon="pi pi-plus" />
      </div>

      <p-card styleClass="shadow-sm">
        <p-table [value]="packages()" [loading]="loading()" styleClass="p-datatable-sm p-datatable-striped" [paginator]="true" [rows]="10">
          <ng-template pTemplate="header">
            <tr>
              <th>رقم الحزمة</th>
              <th>اسم الحزمة</th>
              <th>الفريق</th>
              <th>عدد العمليات</th>
              <th>الحالة</th>
              <th>المبلغ</th>
              <th>الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-pkg>
            <tr>
              <td class="font-mono">{{ pkg.package_number }}</td>
              <td>{{ pkg.package_name }}</td>
              <td>{{ pkg.team?.team_name || '-' }}</td>
              <td>{{ pkg._count?.items || 0 }}</td>
              <td><p-tag [value]="getStatusLabel(pkg.status)" [severity]="getStatusSeverity(pkg.status)" /></td>
              <td>{{ pkg.agreed_amount | currency:'SAR':'symbol':'1.0-0' }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" [rounded]="true" [routerLink]="['/work-packages', pkg.id]" />
                  <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="7" class="text-center py-8 text-gray-500">لا توجد حزم عمل</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class WorkPackagesListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly messageService = inject(MessageService);

  loading = signal(false);
  packages = signal<any[]>([]);

  ngOnInit() { this.loadPackages(); }

  loadPackages() {
    this.loading.set(true);
    this.api.get<any[]>('work-packages').subscribe({
      next: (data) => { this.packages.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل حزم العمل' }); }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      new: 'جديدة', assigned: 'معينة', in_progress: 'قيد التنفيذ',
      completed_by_team: 'مكتملة', under_inspection: 'تحت الفحص',
      approved: 'معتمدة', rejected: 'مرفوضة'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): any {
    const severities: Record<string, any> = {
      new: 'secondary', assigned: 'info', in_progress: 'warn',
      completed_by_team: 'success', under_inspection: 'info',
      approved: 'success', rejected: 'danger'
    };
    return severities[status] || 'secondary';
  }
}
