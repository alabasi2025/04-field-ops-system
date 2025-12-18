import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';

import { WorkersService, Worker } from '../../core/services/workers.service';

@Component({
  selector: 'app-worker-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, TabsModule, TableModule],
  template: `
    @if (worker()) {
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <p-button icon="pi pi-arrow-right" [text]="true" routerLink="/workers" />
          <div>
            <h2 class="text-2xl font-bold">{{ worker()!.full_name }}</h2>
            <p class="text-gray-500">{{ worker()!.worker_code }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2">
            <p-card styleClass="shadow-sm">
              <p-tabs>
                <p-tabpanel header="العمليات">
                  <p-table [value]="workerOperations()" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                      <tr>
                        <th>رقم العملية</th>
                        <th>النوع</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-op>
                      <tr>
                        <td class="font-mono">{{ op.operation_number }}</td>
                        <td>{{ op.operation_type }}</td>
                        <td><p-tag [value]="op.status" /></td>
                        <td>{{ op.created_at | date:'shortDate' }}</td>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                      <tr><td colspan="4" class="text-center py-4 text-gray-500">لا توجد عمليات</td></tr>
                    </ng-template>
                  </p-table>
                </p-tabpanel>
                <p-tabpanel header="الأداء">
                  <p-table [value]="workerPerformance()" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                      <tr>
                        <th>الفترة</th>
                        <th>إجمالي العمليات</th>
                        <th>المكتملة في الوقت</th>
                        <th>نسبة الجودة</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-perf>
                      <tr>
                        <td>{{ perf.period_start | date:'shortDate' }} - {{ perf.period_end | date:'shortDate' }}</td>
                        <td>{{ perf.total_operations }}</td>
                        <td>{{ perf.completed_on_time }}</td>
                        <td>{{ perf.quality_score }}%</td>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                      <tr><td colspan="4" class="text-center py-4 text-gray-500">لا توجد بيانات أداء</td></tr>
                    </ng-template>
                  </p-table>
                </p-tabpanel>
              </p-tabs>
            </p-card>
          </div>

          <div class="space-y-4">
            <p-card header="معلومات العامل" styleClass="shadow-sm">
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">النوع</p>
                  <p class="font-medium">{{ getTypeLabel(worker()!.worker_type) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">الهاتف</p>
                  <p class="font-medium">{{ worker()!.phone || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">البريد</p>
                  <p class="font-medium">{{ worker()!.email || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">الحالة</p>
                  <div class="flex gap-2">
                    <p-tag [value]="worker()!.is_available ? 'متاح' : 'مشغول'" [severity]="worker()!.is_available ? 'success' : 'warn'" />
                    <p-tag [value]="worker()!.is_active ? 'نشط' : 'غير نشط'" [severity]="worker()!.is_active ? 'success' : 'danger'" />
                  </div>
                </div>
              </div>
            </p-card>

            @if (worker()!.last_latitude && worker()!.last_longitude) {
              <p-card header="آخر موقع" styleClass="shadow-sm">
                <div class="space-y-2">
                  <p class="text-sm">{{ worker()!.last_location_at | date:'medium' }}</p>
                  <div class="h-40 bg-gray-200 rounded flex items-center justify-center">
                    <p class="text-gray-500">خريطة</p>
                  </div>
                </div>
              </p-card>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class WorkerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly workersService = inject(WorkersService);

  worker = signal<Worker | null>(null);
  workerOperations = signal<any[]>([]);
  workerPerformance = signal<any[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workersService.getById(id).subscribe({
        next: (data) => this.worker.set(data)
      });
    }
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { technician: 'فني', reader: 'قارئ', collector: 'محصل' };
    return labels[type] || type;
  }
}
