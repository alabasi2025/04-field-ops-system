import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TeamsService, Team } from '../../core/services/teams.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TableModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    @if (team()) {
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <p-button icon="pi pi-arrow-right" [text]="true" routerLink="/teams" />
          <div>
            <h2 class="text-2xl font-bold">{{ team()!.team_name }}</h2>
            <p class="text-gray-500">{{ team()!.team_code }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2">
            <p-card header="أعضاء الفريق" styleClass="shadow-sm">
              <p-table [value]="team()!.members || []" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>الاسم</th>
                    <th>الدور</th>
                    <th>تاريخ الانضمام</th>
                    <th>الحالة</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-member>
                  <tr>
                    <td>{{ member.worker?.full_name }}</td>
                    <td><p-tag [value]="member.role === 'leader' ? 'قائد' : 'عضو'" [severity]="member.role === 'leader' ? 'warn' : 'info'" /></td>
                    <td>{{ member.joined_at | date:'shortDate' }}</td>
                    <td><p-tag [value]="member.is_active ? 'نشط' : 'غير نشط'" [severity]="member.is_active ? 'success' : 'danger'" /></td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr><td colspan="4" class="text-center py-4 text-gray-500">لا يوجد أعضاء</td></tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>

          <div>
            <p-card header="معلومات الفريق" styleClass="shadow-sm">
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">النوع</p>
                  <p class="font-medium">{{ getTypeLabel(team()!.team_type) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">الحالة</p>
                  <p-tag [value]="team()!.is_active ? 'نشط' : 'غير نشط'" [severity]="team()!.is_active ? 'success' : 'danger'" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">عدد العمليات</p>
                  <p class="font-medium">{{ team()!._count?.operations || 0 }}</p>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      </div>
    }
  `
})
export class TeamDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly teamsService = inject(TeamsService);

  team = signal<Team | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.teamsService.getById(id).subscribe({
        next: (data) => this.team.set(data)
      });
    }
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { installation: 'تركيب', maintenance: 'صيانة', reading: 'قراءة' };
    return labels[type] || type;
  }
}
