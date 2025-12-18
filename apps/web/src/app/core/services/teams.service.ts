import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Team {
  id: string;
  team_code: string;
  team_name: string;
  team_type: string;
  station_id?: string;
  supervisor_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
  _count?: { operations: number };
}

export interface TeamMember {
  id: string;
  team_id: string;
  worker_id: string;
  role: string;
  joined_at: string;
  is_active: boolean;
  worker?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private readonly api = inject(ApiService);

  getAll(stationId?: string): Observable<Team[]> {
    return this.api.get<Team[]>('teams', { station_id: stationId });
  }

  getById(id: string): Observable<Team> {
    return this.api.get<Team>(`teams/${id}`);
  }

  create(data: Partial<Team>): Observable<Team> {
    return this.api.post<Team>('teams', data);
  }

  update(id: string, data: Partial<Team>): Observable<Team> {
    return this.api.put<Team>(`teams/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`teams/${id}`);
  }

  getMembers(teamId: string): Observable<TeamMember[]> {
    return this.api.get<TeamMember[]>(`teams/${teamId}/members`);
  }

  addMember(teamId: string, workerId: string, role: string): Observable<TeamMember> {
    return this.api.post<TeamMember>(`teams/${teamId}/members`, { worker_id: workerId, role });
  }

  removeMember(teamId: string, workerId: string): Observable<void> {
    return this.api.delete<void>(`teams/${teamId}/members/${workerId}`);
  }
}
