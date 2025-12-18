import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { WorkersService, Worker } from '../../core/services/workers.service';

@Component({
  selector: 'app-workers-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableModule, ButtonModule, CardModule, TagModule, ToastModule, DialogModule, InputTextModule, SelectModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">العاملين</h2>
        <div class="flex gap-2">
          <p-button label="خريطة المواقع" icon="pi pi-map-marker" [outlined]="true" routerLink="/workers/map" />
          <p-button label="إضافة عامل" icon="pi pi-plus" (click)="showDialog = true; editMode = false; resetForm()" />
        </div>
      </div>

      <p-card styleClass="shadow-sm">
        <p-table [value]="workers()" [loading]="loading()" styleClass="p-datatable-sm p-datatable-striped" [paginator]="true" [rows]="10">
          <ng-template pTemplate="header">
            <tr>
              <th>كود العامل</th>
              <th>الاسم</th>
              <th>النوع</th>
              <th>الهاتف</th>
              <th>متاح</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-worker>
            <tr>
              <td class="font-mono">{{ worker.worker_code }}</td>
              <td>{{ worker.full_name }}</td>
              <td><p-tag [value]="getTypeLabel(worker.worker_type)" /></td>
              <td>{{ worker.phone || '-' }}</td>
              <td><p-tag [value]="worker.is_available ? 'متاح' : 'مشغول'" [severity]="worker.is_available ? 'success' : 'warn'" /></td>
              <td><p-tag [value]="worker.is_active ? 'نشط' : 'غير نشط'" [severity]="worker.is_active ? 'success' : 'danger'" /></td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" [rounded]="true" [routerLink]="['/workers', worker.id]" />
                  <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" (click)="editWorker(worker)" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="7" class="text-center py-8 text-gray-500">لا يوجد عاملين</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <p-dialog [header]="editMode ? 'تعديل عامل' : 'إضافة عامل'" [(visible)]="showDialog" [modal]="true" [style]="{width: '500px'}">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">كود العامل *</label>
          <input pInputText [(ngModel)]="formData.worker_code" class="w-full" [disabled]="editMode" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">الاسم الكامل *</label>
          <input pInputText [(ngModel)]="formData.full_name" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">نوع العامل *</label>
          <p-select [(ngModel)]="formData.worker_type" [options]="typeOptions" placeholder="اختر النوع" styleClass="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">الهاتف</label>
          <input pInputText [(ngModel)]="formData.phone" class="w-full" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input pInputText [(ngModel)]="formData.email" class="w-full" type="email" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="إلغاء" [text]="true" (click)="showDialog = false" />
        <p-button [label]="editMode ? 'حفظ' : 'إضافة'" icon="pi pi-check" (click)="saveWorker()" />
      </ng-template>
    </p-dialog>
  `
})
export class WorkersListComponent implements OnInit {
  private readonly workersService = inject(WorkersService);
  private readonly messageService = inject(MessageService);

  loading = signal(false);
  workers = signal<Worker[]>([]);
  showDialog = false;
  editMode = false;
  selectedWorkerId = '';

  formData = { worker_code: '', full_name: '', worker_type: '', phone: '', email: '' };
  typeOptions = [
    { label: 'فني', value: 'technician' },
    { label: 'قارئ', value: 'reader' },
    { label: 'محصل', value: 'collector' },
  ];

  ngOnInit() { this.loadWorkers(); }

  loadWorkers() {
    this.loading.set(true);
    this.workersService.getAll().subscribe({
      next: (data) => { this.workers.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل العاملين' }); }
    });
  }

  resetForm() { this.formData = { worker_code: '', full_name: '', worker_type: '', phone: '', email: '' }; }

  editWorker(worker: Worker) {
    this.editMode = true;
    this.selectedWorkerId = worker.id;
    this.formData = { worker_code: worker.worker_code, full_name: worker.full_name, worker_type: worker.worker_type, phone: worker.phone || '', email: worker.email || '' };
    this.showDialog = true;
  }

  saveWorker() {
    const request = this.editMode 
      ? this.workersService.update(this.selectedWorkerId, this.formData)
      : this.workersService.create(this.formData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.editMode ? 'تم تحديث العامل' : 'تم إضافة العامل' });
        this.showDialog = false;
        this.loadWorkers();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ العامل' })
    });
  }

  getTypeLabel(type: string): string {
    return this.typeOptions.find(t => t.value === type)?.label || type;
  }
}
