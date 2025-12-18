import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

import { OperationsService, Operation } from '../../core/services/operations.service';

@Component({
  selector: 'app-operation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TabsModule,
    TimelineModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    SelectModule,
    TextareaModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />
    
    @if (operation()) {
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <p-button icon="pi pi-arrow-right" [text]="true" routerLink="/operations" />
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ operation()!.operation_number }}</h2>
              <p class="text-gray-500">{{ operation()!.title }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <p-button label="تغيير الحالة" icon="pi pi-sync" [outlined]="true" (click)="showStatusDialog = true" />
            <p-button label="تعديل" icon="pi pi-pencil" [outlined]="true" [routerLink]="['/operations', operation()!.id, 'edit']" />
            <p-button label="حذف" icon="pi pi-trash" severity="danger" [outlined]="true" (click)="confirmDelete()" />
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Details -->
          <div class="lg:col-span-2 space-y-4">
            <p-card styleClass="shadow-sm">
              <p-tabs>
                <!-- Basic Info Tab -->
                <p-tabpanel header="المعلومات الأساسية">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-500">النوع</p>
                      <p-tag [value]="getTypeLabel(operation()!.operation_type)" [severity]="getTypeSeverity(operation()!.operation_type)" />
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">الحالة</p>
                      <p-tag [value]="getStatusLabel(operation()!.status)" [severity]="getStatusSeverity(operation()!.status)" />
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">الأولوية</p>
                      <p-tag [value]="getPriorityLabel(operation()!.priority)" [severity]="getPrioritySeverity(operation()!.priority)" />
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">تاريخ الإنشاء</p>
                      <p class="font-medium">{{ operation()!.created_at | date:'medium' }}</p>
                    </div>
                    @if (operation()!.scheduled_date) {
                      <div>
                        <p class="text-sm text-gray-500">تاريخ الجدولة</p>
                        <p class="font-medium">{{ operation()!.scheduled_date | date:'medium' }}</p>
                      </div>
                    }
                    @if (operation()!.description) {
                      <div class="col-span-2">
                        <p class="text-sm text-gray-500">الوصف</p>
                        <p class="font-medium">{{ operation()!.description }}</p>
                      </div>
                    }
                  </div>
                </p-tabpanel>

                <!-- Location Tab -->
                <p-tabpanel header="الموقع">
                  <div class="space-y-4">
                    @if (operation()!.address) {
                      <div>
                        <p class="text-sm text-gray-500">العنوان</p>
                        <p class="font-medium">{{ operation()!.address }}</p>
                      </div>
                    }
                    @if (operation()!.latitude && operation()!.longitude) {
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <p class="text-sm text-gray-500">خط العرض</p>
                          <p class="font-medium font-mono">{{ operation()!.latitude }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-500">خط الطول</p>
                          <p class="font-medium font-mono">{{ operation()!.longitude }}</p>
                        </div>
                      </div>
                      <div class="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p class="text-gray-500">خريطة الموقع</p>
                      </div>
                    } @else {
                      <p class="text-gray-500">لم يتم تحديد الموقع</p>
                    }
                  </div>
                </p-tabpanel>

                <!-- Notes Tab -->
                <p-tabpanel header="الملاحظات">
                  @if (operation()!.notes) {
                    <p>{{ operation()!.notes }}</p>
                  } @else {
                    <p class="text-gray-500">لا توجد ملاحظات</p>
                  }
                </p-tabpanel>
              </p-tabs>
            </p-card>

            <!-- Status History -->
            <p-card header="سجل الحالات" styleClass="shadow-sm">
              @if (operation()?.status_logs && operation()!.status_logs!.length > 0) {
                <p-timeline [value]="operation()!.status_logs">
                  <ng-template pTemplate="content" let-log>
                    <div class="flex items-center gap-2">
                      <p-tag [value]="getStatusLabel(log.new_status)" [severity]="getStatusSeverity(log.new_status)" />
                      <span class="text-sm text-gray-500">{{ log.created_at | date:'medium' }}</span>
                    </div>
                    @if (log.change_reason) {
                      <p class="text-sm text-gray-600 mt-1">{{ log.change_reason }}</p>
                    }
                  </ng-template>
                </p-timeline>
              } @else {
                <p class="text-gray-500">لا يوجد سجل حالات</p>
              }
            </p-card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <!-- Assignment -->
            <p-card header="التعيين" styleClass="shadow-sm">
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500">الفريق</p>
                  @if (operation()!.team) {
                    <p class="font-medium">{{ operation()!.team.team_name }}</p>
                  } @else {
                    <p class="text-gray-400">غير معين</p>
                  }
                </div>
                <div>
                  <p class="text-sm text-gray-500">العامل</p>
                  @if (operation()!.worker) {
                    <p class="font-medium">{{ operation()!.worker.full_name }}</p>
                  } @else {
                    <p class="text-gray-400">غير معين</p>
                  }
                </div>
              </div>
            </p-card>

            <!-- Cost -->
            <p-card header="التكلفة" styleClass="shadow-sm">
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500">التكلفة المقدرة</p>
                  <p class="font-medium text-lg">{{ operation()!.estimated_cost | currency:'SAR':'symbol':'1.2-2' }}</p>
                </div>
                @if (operation()!.actual_cost) {
                  <div>
                    <p class="text-sm text-gray-500">التكلفة الفعلية</p>
                    <p class="font-medium text-lg">{{ operation()!.actual_cost | currency:'SAR':'symbol':'1.2-2' }}</p>
                  </div>
                }
              </div>
            </p-card>

            <!-- Timestamps -->
            <p-card header="التواريخ" styleClass="shadow-sm">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">الإنشاء</span>
                  <span>{{ operation()!.created_at | date:'short' }}</span>
                </div>
                @if (operation()!.started_at) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">البدء</span>
                    <span>{{ operation()!.started_at | date:'short' }}</span>
                  </div>
                }
                @if (operation()!.completed_at) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">الإكمال</span>
                    <span>{{ operation()!.completed_at | date:'short' }}</span>
                  </div>
                }
              </div>
            </p-card>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-64">
        <i class="pi pi-spin pi-spinner text-4xl"></i>
      </div>
    }

    <!-- Status Change Dialog -->
    <p-dialog header="تغيير الحالة" [(visible)]="showStatusDialog" [modal]="true" [style]="{width: '400px'}">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">الحالة الجديدة</label>
          <p-select 
            [(ngModel)]="newStatus"
            [options]="statusOptions"
            placeholder="اختر الحالة"
            styleClass="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">السبب (اختياري)</label>
          <textarea pInputTextarea [(ngModel)]="statusReason" [rows]="3" class="w-full"></textarea>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="إلغاء" [text]="true" (click)="showStatusDialog = false" />
        <p-button label="تغيير" icon="pi pi-check" (click)="changeStatus()" [disabled]="!newStatus" />
      </ng-template>
    </p-dialog>
  `
})
export class OperationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly operationsService = inject(OperationsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  operation = signal<Operation | null>(null);
  showStatusDialog = false;
  newStatus = '';
  statusReason = '';

  statusOptions = [
    { label: 'مجدولة', value: 'scheduled' },
    { label: 'معينة', value: 'assigned' },
    { label: 'قيد التنفيذ', value: 'in_progress' },
    { label: 'مكتملة', value: 'completed' },
    { label: 'معلقة', value: 'on_hold' },
    { label: 'ملغاة', value: 'cancelled' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOperation(id);
    }
  }

  loadOperation(id: string) {
    this.operationsService.getById(id).subscribe({
      next: (data) => this.operation.set(data),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل العملية' });
        this.router.navigate(['/operations']);
      }
    });
  }

  changeStatus() {
    if (!this.operation() || !this.newStatus) return;

    this.operationsService.updateStatus(this.operation()!.id, this.newStatus, this.statusReason).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تغيير الحالة بنجاح' });
        this.showStatusDialog = false;
        this.loadOperation(this.operation()!.id);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل في تغيير الحالة' });
      }
    });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه العملية؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.operationsService.delete(this.operation()!.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف العملية بنجاح' });
            setTimeout(() => this.router.navigate(['/operations']), 1000);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف العملية' });
          }
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      installation: 'تركيب', maintenance: 'صيانة', inspection: 'فحص',
      disconnection: 'فصل', reconnection: 'إعادة توصيل', meter_reading: 'قراءة',
      collection: 'تحصيل', migration: 'ترحيل', replacement: 'استبدال',
    };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): any {
    const severities: Record<string, any> = {
      installation: 'success', maintenance: 'warn', inspection: 'info',
      disconnection: 'danger', reconnection: 'success', meter_reading: 'info',
    };
    return severities[type] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'مسودة', scheduled: 'مجدولة', assigned: 'معينة',
      in_progress: 'قيد التنفيذ', completed: 'مكتملة', cancelled: 'ملغاة',
      on_hold: 'معلقة', rejected: 'مرفوضة', approved: 'معتمدة',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): any {
    const severities: Record<string, any> = {
      draft: 'secondary', scheduled: 'info', assigned: 'info',
      in_progress: 'warn', completed: 'success', cancelled: 'danger',
      on_hold: 'warn', rejected: 'danger', approved: 'success',
    };
    return severities[status] || 'secondary';
  }

  getPriorityLabel(priority: number): string {
    const labels: Record<number, string> = { 1: 'عاجل', 2: 'عادي', 3: 'منخفض' };
    return labels[priority] || 'عادي';
  }

  getPrioritySeverity(priority: number): any {
    const severities: Record<number, any> = { 1: 'danger', 2: 'info', 3: 'secondary' };
    return severities[priority] || 'info';
  }
}
