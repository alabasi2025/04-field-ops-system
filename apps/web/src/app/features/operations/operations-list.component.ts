import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';

import { OperationsService, Operation, OperationQuery } from '../../core/services/operations.service';

@Component({
  selector: 'app-operations-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    CardModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    PaginatorModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />
    
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">العمليات الميدانية</h2>
        <p-button 
          label="إنشاء عملية" 
          icon="pi pi-plus" 
          routerLink="/operations/new"
        />
      </div>

      <!-- Filters -->
      <p-card styleClass="shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">بحث</label>
            <span class="p-input-icon-right w-full">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [(ngModel)]="filters.search"
                placeholder="رقم العملية، العنوان..."
                class="w-full"
                (keyup.enter)="loadOperations()"
              />
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">النوع</label>
            <p-select 
              [options]="typeOptions" 
              [(ngModel)]="filters.operation_type"
              placeholder="جميع الأنواع"
              [showClear]="true"
              styleClass="w-full"
              (onChange)="loadOperations()"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <p-select 
              [options]="statusOptions" 
              [(ngModel)]="filters.status"
              placeholder="جميع الحالات"
              [showClear]="true"
              styleClass="w-full"
              (onChange)="loadOperations()"
            />
          </div>
          <div class="flex items-end">
            <p-button 
              label="بحث" 
              icon="pi pi-search" 
              (click)="loadOperations()"
              styleClass="w-full"
            />
          </div>
        </div>
      </p-card>

      <!-- Table -->
      <p-card styleClass="shadow-sm">
        <p-table 
          [value]="operations()" 
          [loading]="loading()"
          styleClass="p-datatable-sm p-datatable-striped"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 140px">رقم العملية</th>
              <th style="width: 100px">النوع</th>
              <th>العنوان</th>
              <th style="width: 100px">الأولوية</th>
              <th style="width: 120px">الحالة</th>
              <th style="width: 120px">التاريخ</th>
              <th style="width: 120px">الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-op>
            <tr>
              <td class="font-mono text-sm">{{ op.operation_number }}</td>
              <td>
                <p-tag [value]="getTypeLabel(op.operation_type)" [severity]="getTypeSeverity(op.operation_type)" />
              </td>
              <td>
                <div class="font-medium">{{ op.title }}</div>
                @if (op.address) {
                  <div class="text-sm text-gray-500">{{ op.address }}</div>
                }
              </td>
              <td>
                <p-tag [value]="getPriorityLabel(op.priority)" [severity]="getPrioritySeverity(op.priority)" />
              </td>
              <td>
                <p-tag [value]="getStatusLabel(op.status)" [severity]="getStatusSeverity(op.status)" />
              </td>
              <td class="text-sm">{{ op.created_at | date:'shortDate' }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button 
                    icon="pi pi-eye" 
                    [text]="true" 
                    [rounded]="true"
                    pTooltip="عرض"
                    [routerLink]="['/operations', op.id]"
                  />
                  <p-button 
                    icon="pi pi-pencil" 
                    [text]="true" 
                    [rounded]="true"
                    pTooltip="تعديل"
                    [routerLink]="['/operations', op.id, 'edit']"
                  />
                  <p-button 
                    icon="pi pi-trash" 
                    [text]="true" 
                    [rounded]="true"
                    severity="danger"
                    pTooltip="حذف"
                    (click)="confirmDelete(op)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-8 text-gray-500">
                <i class="pi pi-inbox text-4xl mb-2"></i>
                <p>لا توجد عمليات</p>
              </td>
            </tr>
          </ng-template>
        </p-table>

        <!-- Paginator -->
        @if (totalRecords() > 0) {
          <p-paginator 
            [rows]="filters.limit || 10"
            [totalRecords]="totalRecords()"
            [first]="((filters.page || 1) - 1) * (filters.limit || 10)"
            (onPageChange)="onPageChange($event)"
            [rowsPerPageOptions]="[10, 25, 50]"
          />
        }
      </p-card>
    </div>
  `
})
export class OperationsListComponent implements OnInit {
  private readonly operationsService = inject(OperationsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  loading = signal(false);
  operations = signal<Operation[]>([]);
  totalRecords = signal(0);

  filters: OperationQuery = {
    page: 1,
    limit: 10
  };

  typeOptions = [
    { label: 'تركيب', value: 'installation' },
    { label: 'صيانة', value: 'maintenance' },
    { label: 'فحص', value: 'inspection' },
    { label: 'فصل', value: 'disconnection' },
    { label: 'إعادة توصيل', value: 'reconnection' },
    { label: 'قراءة عداد', value: 'meter_reading' },
    { label: 'تحصيل', value: 'collection' },
    { label: 'ترحيل', value: 'migration' },
    { label: 'استبدال', value: 'replacement' },
  ];

  statusOptions = [
    { label: 'مسودة', value: 'draft' },
    { label: 'مجدولة', value: 'scheduled' },
    { label: 'معينة', value: 'assigned' },
    { label: 'قيد التنفيذ', value: 'in_progress' },
    { label: 'مكتملة', value: 'completed' },
    { label: 'ملغاة', value: 'cancelled' },
    { label: 'معلقة', value: 'on_hold' },
  ];

  ngOnInit() {
    this.loadOperations();
  }

  loadOperations() {
    this.loading.set(true);
    this.operationsService.getAll(this.filters).subscribe({
      next: (response) => {
        this.operations.set(response.data);
        this.totalRecords.set(response.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل العمليات' });
      }
    });
  }

  onPageChange(event: any) {
    this.filters.page = Math.floor(event.first / event.rows) + 1;
    this.filters.limit = event.rows;
    this.loadOperations();
  }

  confirmDelete(operation: Operation) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف العملية ${operation.operation_number}؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.operationsService.delete(operation.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف العملية بنجاح' });
            this.loadOperations();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف العملية' });
          }
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.typeOptions.find(t => t.value === type)?.label || type;
  }

  getTypeSeverity(type: string): any {
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
    return this.statusOptions.find(s => s.value === status)?.label || status;
  }

  getStatusSeverity(status: string): any {
    const severities: Record<string, any> = {
      draft: 'secondary',
      scheduled: 'info',
      assigned: 'info',
      in_progress: 'warn',
      completed: 'success',
      cancelled: 'danger',
      on_hold: 'warn',
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
