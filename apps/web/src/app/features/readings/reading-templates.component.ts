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
  selector: 'app-reading-templates',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, CardModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">قوالب جولات القراءة</h2>
        <p-button label="إنشاء قالب" icon="pi pi-plus" />
      </div>

      <p-card styleClass="shadow-sm">
        <p-table [value]="templates()" [loading]="loading()" styleClass="p-datatable-sm p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>كود القالب</th>
              <th>اسم القالب</th>
              <th>التكرار</th>
              <th>عدد العدادات</th>
              <th>عدد الجولات</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tmpl>
            <tr>
              <td class="font-mono">{{ tmpl.template_code }}</td>
              <td>{{ tmpl.template_name }}</td>
              <td><p-tag [value]="getFrequencyLabel(tmpl.frequency)" /></td>
              <td>{{ tmpl.items?.length || 0 }}</td>
              <td>{{ tmpl._count?.rounds || 0 }}</td>
              <td><p-tag [value]="tmpl.is_active ? 'نشط' : 'غير نشط'" [severity]="tmpl.is_active ? 'success' : 'danger'" /></td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-calendar-plus" [text]="true" [rounded]="true" pTooltip="إنشاء جولة" (click)="createRound(tmpl)" />
                  <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="7" class="text-center py-8 text-gray-500">لا توجد قوالب</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class ReadingTemplatesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly messageService = inject(MessageService);

  loading = signal(false);
  templates = signal<any[]>([]);

  ngOnInit() { this.loadTemplates(); }

  loadTemplates() {
    this.loading.set(true);
    this.api.get<any[]>('readings/templates').subscribe({
      next: (data) => { this.templates.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  createRound(template: any) {
    const today = new Date().toISOString().split('T')[0];
    this.api.post('readings/rounds', { template_id: template.id, scheduled_date: today }).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إنشاء الجولة بنجاح' }),
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في إنشاء الجولة' })
    });
  }

  getFrequencyLabel(freq: string): string {
    const labels: Record<string, string> = { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' };
    return labels[freq] || freq;
  }
}
