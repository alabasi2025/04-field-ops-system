import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

import { TeamsService, Team } from '../../core/services/teams.service';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableModule, ButtonModule, CardModule, TagModule, ToastModule, DialogModule, InputTextModule, SelectModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">الفرق</h2>
        <p-button label="إضافة فريق" icon="pi pi-plus" (click)="showDialog = true; editMode = false; resetForm()" />
      </div>

      <p-card styleClass="shadow-sm">
        <p-table [value]="teams()" [loading]="loading()" styleClass="p-datatable-sm p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>كود الفريق</th>
              <th>اسم الفريق</th>
              <th>النوع</th>
              <th>عدد الأعضاء</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-team>
            <tr>
              <td class="font-mono">{{ team.team_code }}</td>
              <td>{{ team.team_name }}</td>
              <td><p-tag [value]="getTypeLabel(team.team_type)" /></td>
              <td>{{ team.members?.length || 0 }}</td>
              <td><p-tag [value]="team.is_active ? 'نشط' : 'غير نشط'" [severity]="team.is_active ? 'success' : 'danger'" /></td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" [rounded]="true" [routerLink]="['/teams', team.id]" />
                  <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" (click)="editTeam(team)" />
                  <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (click)="deleteTeam(team)" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center py-8 text-gray-500">لا توجد فرق</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <p-dialog [header]="editMode ? 'تعديل فريق' : 'إضافة فريق'" [(visible)]="showDialog" [modal]="true" [style]="{width: '450px'}">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">كود الفريق *</label>
          <input pInputText [(ngModel)]="formData.team_code" class="w-full" [disabled]="editMode" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">اسم الفريق *</label>
          <input pInputText [(ngModel)]="formData.team_name" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">نوع الفريق *</label>
          <p-select [(ngModel)]="formData.team_type" [options]="typeOptions" placeholder="اختر النوع" styleClass="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="إلغاء" [text]="true" (click)="showDialog = false" />
        <p-button [label]="editMode ? 'حفظ' : 'إضافة'" icon="pi pi-check" (click)="saveTeam()" />
      </ng-template>
    </p-dialog>
  `
})
export class TeamsListComponent implements OnInit {
  private readonly teamsService = inject(TeamsService);
  private readonly messageService = inject(MessageService);

  loading = signal(false);
  teams = signal<Team[]>([]);
  showDialog = false;
  editMode = false;
  selectedTeamId = '';

  formData = { team_code: '', team_name: '', team_type: '' };
  typeOptions = [
    { label: 'تركيب', value: 'installation' },
    { label: 'صيانة', value: 'maintenance' },
    { label: 'قراءة', value: 'reading' },
  ];

  ngOnInit() { this.loadTeams(); }

  loadTeams() {
    this.loading.set(true);
    this.teamsService.getAll().subscribe({
      next: (data) => { this.teams.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل الفرق' }); }
    });
  }

  resetForm() { this.formData = { team_code: '', team_name: '', team_type: '' }; }

  editTeam(team: Team) {
    this.editMode = true;
    this.selectedTeamId = team.id;
    this.formData = { team_code: team.team_code, team_name: team.team_name, team_type: team.team_type };
    this.showDialog = true;
  }

  saveTeam() {
    const request = this.editMode 
      ? this.teamsService.update(this.selectedTeamId, this.formData)
      : this.teamsService.create(this.formData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.editMode ? 'تم تحديث الفريق' : 'تم إضافة الفريق' });
        this.showDialog = false;
        this.loadTeams();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ الفريق' })
    });
  }

  deleteTeam(team: Team) {
    this.teamsService.delete(team.id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الفريق' }); this.loadTeams(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف الفريق' })
    });
  }

  getTypeLabel(type: string): string {
    return this.typeOptions.find(t => t.value === type)?.label || type;
  }
}
