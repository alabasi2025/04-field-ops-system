import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Operation {
  id: string;
  operation_number: string;
  operation_type: string;
  status: string;
  priority: number;
  title: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  customer_id?: string;
  meter_id?: string;
  assigned_team_id?: string;
  assigned_worker_id?: string;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  team?: any;
  worker?: any;
  status_logs?: any[];
}

export interface OperationQuery {
  operation_type?: string;
  status?: string;
  team_id?: string;
  worker_id?: string;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private readonly api = inject(ApiService);

  getAll(query?: OperationQuery): Observable<PaginatedResponse<Operation>> {
    return this.api.get<PaginatedResponse<Operation>>('operations', query);
  }

  getById(id: string): Observable<Operation> {
    return this.api.get<Operation>(`operations/${id}`);
  }

  create(data: Partial<Operation>): Observable<Operation> {
    return this.api.post<Operation>('operations', data);
  }

  update(id: string, data: Partial<Operation>): Observable<Operation> {
    return this.api.put<Operation>(`operations/${id}`, data);
  }

  updateStatus(id: string, status: string, reason?: string): Observable<Operation> {
    return this.api.put<Operation>(`operations/${id}/status`, { status, reason });
  }

  assign(id: string, teamId?: string, workerId?: string): Observable<Operation> {
    return this.api.put<Operation>(`operations/${id}/assign`, { team_id: teamId, worker_id: workerId });
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`operations/${id}`);
  }

  getStatistics(stationId?: string): Observable<any> {
    return this.api.get<any>('operations/statistics', { station_id: stationId });
  }
}
