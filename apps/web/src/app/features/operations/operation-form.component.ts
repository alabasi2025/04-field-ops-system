import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { OperationsService } from '../../core/services/operations.service';
import { TeamsService, Team } from '../../core/services/teams.service';
import { WorkersService, Worker } from '../../core/services/workers.service';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <p-button icon="pi pi-arrow-right" [text]="true" routerLink="/operations" />
        <h2 class="text-2xl font-bold text-gray-800">{{ isEdit() ? 'تعديل عملية' : 'إنشاء عملية جديدة' }}</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Basic Info -->
          <p-card header="المعلومات الأساسية" styleClass="shadow-sm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">نوع العملية *</label>
                <p-select 
                  formControlName="operation_type"
                  [options]="typeOptions"
                  placeholder="اختر نوع العملية"
                  styleClass="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
                <input pInputText formControlName="title" class="w-full" placeholder="عنوان العملية" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea pInputTextarea formControlName="description" [rows]="3" class="w-full" placeholder="وصف تفصيلي للعملية"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                <p-select 
                  formControlName="priority"
                  [options]="priorityOptions"
                  placeholder="اختر الأولوية"
                  styleClass="w-full"
                />
              </div>
            </div>
          </p-card>

          <!-- Location -->
          <p-card header="الموقع" styleClass="shadow-sm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input pInputText formControlName="address" class="w-full" placeholder="العنوان التفصيلي" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">خط العرض</label>
                  <p-inputNumber formControlName="latitude" [minFractionDigits]="6" [maxFractionDigits]="6" styleClass="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">خط الطول</label>
                  <p-inputNumber formControlName="longitude" [minFractionDigits]="6" [maxFractionDigits]="6" styleClass="w-full" />
                </div>
              </div>
              <div>
                <p-button label="تحديد الموقع على الخريطة" icon="pi pi-map-marker" [outlined]="true" styleClass="w-full" />
              </div>
            </div>
          </p-card>

          <!-- Assignment -->
          <p-card header="التعيين" styleClass="shadow-sm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الفريق</label>
                <p-select 
                  formControlName="assigned_team_id"
                  [options]="teams()"
                  optionLabel="team_name"
                  optionValue="id"
                  placeholder="اختر الفريق"
                  [showClear]="true"
                  styleClass="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">العامل</label>
                <p-select 
                  formControlName="assigned_worker_id"
                  [options]="workers()"
                  optionLabel="full_name"
                  optionValue="id"
                  placeholder="اختر العامل"
                  [showClear]="true"
                  styleClass="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الجدولة</label>
                <p-datepicker 
                  formControlName="scheduled_date"
                  [showTime]="true"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                />
              </div>
            </div>
          </p-card>

          <!-- Cost & Notes -->
          <p-card header="التكلفة والملاحظات" styleClass="shadow-sm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">التكلفة المقدرة</label>
                <p-inputNumber 
                  formControlName="estimated_cost"
                  mode="currency"
                  currency="SAR"
                  locale="ar-SA"
                  styleClass="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea pInputTextarea formControlName="notes" [rows]="4" class="w-full" placeholder="ملاحظات إضافية"></textarea>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-4">
          <p-button label="إلغاء" [outlined]="true" routerLink="/operations" />
          <p-button 
            [label]="isEdit() ? 'حفظ التغييرات' : 'إنشاء العملية'" 
            icon="pi pi-check"
            type="submit"
            [loading]="saving()"
            [disabled]="form.invalid"
          />
        </div>
      </form>
    </div>
  `
})
export class OperationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly operationsService = inject(OperationsService);
  private readonly teamsService = inject(TeamsService);
  private readonly workersService = inject(WorkersService);
  private readonly messageService = inject(MessageService);

  isEdit = signal(false);
  saving = signal(false);
  teams = signal<Team[]>([]);
  workers = signal<Worker[]>([]);
  operationId: string | null = null;

  form: FormGroup = this.fb.group({
    operation_type: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: [2],
    address: [''],
    latitude: [null],
    longitude: [null],
    assigned_team_id: [null],
    assigned_worker_id: [null],
    scheduled_date: [null],
    estimated_cost: [null],
    notes: [''],
  });

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

  priorityOptions = [
    { label: 'عاجل', value: 1 },
    { label: 'عادي', value: 2 },
    { label: 'منخفض', value: 3 },
  ];

  ngOnInit() {
    this.loadTeams();
    this.loadWorkers();

    this.operationId = this.route.snapshot.paramMap.get('id');
    if (this.operationId) {
      this.isEdit.set(true);
      this.loadOperation();
    }
  }

  loadTeams() {
    this.teamsService.getAll().subscribe({
      next: (data) => this.teams.set(data)
    });
  }

  loadWorkers() {
    this.workersService.getAll().subscribe({
      next: (data) => this.workers.set(data)
    });
  }

  loadOperation() {
    if (!this.operationId) return;

    this.operationsService.getById(this.operationId).subscribe({
      next: (op) => {
        this.form.patchValue({
          operation_type: op.operation_type,
          title: op.title,
          description: op.description,
          priority: op.priority,
          address: op.address,
          latitude: op.latitude,
          longitude: op.longitude,
          assigned_team_id: op.assigned_team_id,
          assigned_worker_id: op.assigned_worker_id,
          scheduled_date: op.scheduled_date ? new Date(op.scheduled_date) : null,
          estimated_cost: op.estimated_cost,
          notes: op.notes,
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل العملية' });
        this.router.navigate(['/operations']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.saving.set(true);
    const data = this.form.value;

    const request = this.isEdit() 
      ? this.operationsService.update(this.operationId!, data)
      : this.operationsService.create(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.isEdit() ? 'تم تحديث العملية بنجاح' : 'تم إنشاء العملية بنجاح' 
        });
        setTimeout(() => this.router.navigate(['/operations']), 1000);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ العملية' });
      }
    });
  }
}
