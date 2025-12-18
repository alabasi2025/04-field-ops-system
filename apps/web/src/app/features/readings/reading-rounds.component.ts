import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reading-rounds',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, CardModule, TagModule, ProgressBarModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">جولات القراءة</h2>
        <p-button label="إنشاء جولة" icon="pi pi-plus" routerLink="/readings/templates" />
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-600">{{ rounds().length }}</p>
            <p class="text-gray-500">إجمالي الجولات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-yellow-600">{{ inProgressCount() }}</p>
            <p class="text-gray-500">قيد التنفيذ</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ completedCount() }}</p>
            <p class="text-gray-500">مكتملة</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-gray-600">{{ scheduledCount() }}</p>
            <p class="text-gray-500">مجدولة</p>
          </div>
        </p-card>
      </div>

      <p-card styleClass="shadow-sm">
        <p-table [value]="rounds()" [loading]="loading()" styleClass="p-datatable-sm p-datatable-striped" [paginator]="true" [rows]="10">
          <ng-template pTemplate="header">
            <tr>
              <th>رقم الجولة</th>
              <th>القالب</th>
              <th>التاريخ</th>
              <th>التقدم</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-round>
            <tr>
              <td class="font-mono">{{ round.round_number }}</td>
              <td>{{ round.template?.template_name || '-' }}</td>
              <td>{{ round.scheduled_date | date:'shortDate' }}</td>
              <td style="width: 200px">
                <div class="flex items-center gap-2">
                  <p-progressBar [value]="getProgress(round)" [showValue]="false" styleClass="h-2 flex-1" />
                  <span class="text-sm">{{ round.read_meters }}/{{ round.total_meters }}</span>
                </div>
              </td>
              <td><p-tag [value]="getStatusLabel(round.status)" [severity]="getStatusSeverity(round.status)" /></td>
              <td>
                <div class="flex gap-1">
                  @if (round.status === 'scheduled') {
                    <p-button icon="pi pi-play" [text]="true" [rounded]="true" pTooltip="بدء" (click)="startRound(round)" />
                  }
                  @if (round.status === 'in_progress') {
                    <p-button icon="pi pi-check" [text]="true" [rounded]="true" pTooltip="إكمال" (click)="completeRound(round)" />
                  }
                  <p-button icon="pi pi-eye" [text]="true" [rounded]="true" pTooltip="عرض" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center py-8 text-gray-500">لا توجد جولات</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class ReadingRoundsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly messageService = inject(MessageService);

  loading = signal(false);
  rounds = signal<any[]>([]);

  inProgressCount = signal(0);
  completedCount = signal(0);
  scheduledCount = signal(0);

  ngOnInit() { this.loadRounds(); }

  loadRounds() {
    this.loading.set(true);
    this.api.get<any[]>('readings/rounds').subscribe({
      next: (data) => {
        this.rounds.set(data);
        this.inProgressCount.set(data.filter(r => r.status === 'in_progress').length);
        this.completedCount.set(data.filter(r => r.status === 'completed').length);
        this.scheduledCount.set(data.filter(r => r.status === 'scheduled').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startRound(round: any) {
    this.api.put(`readings/rounds/${round.id}/start`, {}).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم بدء الجولة' }); this.loadRounds(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في بدء الجولة' })
    });
  }

  completeRound(round: any) {
    this.api.put(`readings/rounds/${round.id}/complete`, {}).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إكمال الجولة' }); this.loadRounds(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في إكمال الجولة' })
    });
  }

  getProgress(round: any): number {
    if (!round.total_meters) return 0;
    return Math.round((round.read_meters / round.total_meters) * 100);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { scheduled: 'مجدولة', in_progress: 'قيد التنفيذ', completed: 'مكتملة' };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): any {
    const severities: Record<string, any> = { scheduled: 'info', in_progress: 'warn', completed: 'success' };
    return severities[status] || 'secondary';
  }
}
