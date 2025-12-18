import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { StepsModule } from 'primeng/steps';

import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-work-package-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, TableModule, StepsModule],
  template: `
    @if (pkg()) {
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <p-button icon="pi pi-arrow-right" [text]="true" routerLink="/work-packages" />
            <div>
              <h2 class="text-2xl font-bold">{{ pkg()!.package_number }}</h2>
              <p class="text-gray-500">{{ pkg()!.package_name }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            @if (pkg()!.status === 'new') {
              <p-button label="تعيين فريق" icon="pi pi-users" [outlined]="true" />
            }
            @if (pkg()!.status === 'assigned') {
              <p-button label="بدء العمل" icon="pi pi-play" />
            }
            @if (pkg()!.status === 'in_progress') {
              <p-button label="إكمال" icon="pi pi-check" severity="success" />
            }
          </div>
        </div>

        <!-- Status Steps -->
        <p-card styleClass="shadow-sm">
          <p-steps [model]="steps" [activeIndex]="getActiveStep()" [readonly]="true" />
        </p-card>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2">
            <p-card header="عمليات الحزمة" styleClass="shadow-sm">
              <p-table [value]="pkg()!.items || []" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>#</th>
                    <th>رقم العملية</th>
                    <th>النوع</th>
                    <th>الحالة</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item let-i="rowIndex">
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td class="font-mono">{{ item.operation?.operation_number || item.operation_id }}</td>
                    <td>{{ item.operation?.operation_type || '-' }}</td>
                    <td><p-tag [value]="item.status || 'pending'" /></td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr><td colspan="4" class="text-center py-4 text-gray-500">لا توجد عمليات</td></tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>

          <div class="space-y-4">
            <p-card header="معلومات الحزمة" styleClass="shadow-sm">
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">الحالة</p>
                  <p-tag [value]="getStatusLabel(pkg()!.status)" [severity]="getStatusSeverity(pkg()!.status)" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">الفريق</p>
                  <p class="font-medium">{{ pkg()!.team?.team_name || 'غير معين' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">المقاول</p>
                  <p class="font-medium">{{ pkg()!.contractor_name || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">المبلغ المتفق عليه</p>
                  <p class="font-medium text-lg">{{ pkg()!.agreed_amount | currency:'SAR':'symbol':'1.0-0' }}</p>
                </div>
              </div>
            </p-card>

            <p-card header="التواريخ" styleClass="shadow-sm">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">الإنشاء</span>
                  <span>{{ pkg()!.created_at | date:'shortDate' }}</span>
                </div>
                @if (pkg()!.assigned_at) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">التعيين</span>
                    <span>{{ pkg()!.assigned_at | date:'shortDate' }}</span>
                  </div>
                }
                @if (pkg()!.started_at) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">البدء</span>
                    <span>{{ pkg()!.started_at | date:'shortDate' }}</span>
                  </div>
                }
                @if (pkg()!.completed_at) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">الإكمال</span>
                    <span>{{ pkg()!.completed_at | date:'shortDate' }}</span>
                  </div>
                }
              </div>
            </p-card>
          </div>
        </div>
      </div>
    }
  `
})
export class WorkPackageDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  pkg = signal<any>(null);

  steps = [
    { label: 'جديدة' },
    { label: 'معينة' },
    { label: 'قيد التنفيذ' },
    { label: 'مكتملة' },
    { label: 'تحت الفحص' },
    { label: 'معتمدة' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`work-packages/${id}`).subscribe({
        next: (data) => this.pkg.set(data)
      });
    }
  }

  getActiveStep(): number {
    const statusMap: Record<string, number> = {
      new: 0, assigned: 1, in_progress: 2, completed_by_team: 3, under_inspection: 4, approved: 5
    };
    return statusMap[this.pkg()?.status] || 0;
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
