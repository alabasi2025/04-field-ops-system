import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

import { WorkersService, WorkerLocation } from '../../core/services/workers.service';

@Component({
  selector: 'app-workers-map',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, TableModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <p-button icon="pi pi-arrow-right" [text]="true" routerLink="/workers" />
          <h2 class="text-2xl font-bold text-gray-800">خريطة مواقع العاملين</h2>
        </div>
        <p-button label="تحديث" icon="pi pi-refresh" [outlined]="true" (click)="loadLocations()" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Map -->
        <div class="lg:col-span-2">
          <p-card styleClass="shadow-sm h-full">
            <div class="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <div class="text-center text-gray-500">
                <i class="pi pi-map text-6xl mb-4"></i>
                <p>خريطة تتبع المواقع</p>
                <p class="text-sm">يتم عرض {{ locations().length }} عامل على الخريطة</p>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Workers List -->
        <div>
          <p-card header="العاملين النشطين" styleClass="shadow-sm">
            <p-table [value]="locations()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="350px">
              <ng-template pTemplate="header">
                <tr>
                  <th>العامل</th>
                  <th>الحالة</th>
                  <th>آخر تحديث</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-loc>
                <tr>
                  <td>
                    <div>
                      <p class="font-medium">{{ loc.full_name }}</p>
                      <p class="text-xs text-gray-500">{{ loc.worker_code }}</p>
                    </div>
                  </td>
                  <td>
                    <p-tag [value]="loc.is_available ? 'متاح' : 'مشغول'" [severity]="loc.is_available ? 'success' : 'warn'" />
                  </td>
                  <td class="text-xs">{{ loc.last_location_at | date:'shortTime' }}</td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="3" class="text-center py-4 text-gray-500">لا توجد بيانات مواقع</td></tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-600">{{ locations().length }}</p>
            <p class="text-gray-500">إجمالي العاملين</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ availableCount() }}</p>
            <p class="text-gray-500">متاحين</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-yellow-600">{{ busyCount() }}</p>
            <p class="text-gray-500">مشغولين</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <p class="text-3xl font-bold text-gray-600">{{ offlineCount() }}</p>
            <p class="text-gray-500">غير متصلين</p>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class WorkersMapComponent implements OnInit {
  private readonly workersService = inject(WorkersService);

  loading = signal(false);
  locations = signal<WorkerLocation[]>([]);

  availableCount = signal(0);
  busyCount = signal(0);
  offlineCount = signal(0);

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.loading.set(true);
    this.workersService.getAllLocations().subscribe({
      next: (data) => {
        this.locations.set(data);
        this.availableCount.set(data.filter(w => w.is_available).length);
        this.busyCount.set(data.filter(w => !w.is_available).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
