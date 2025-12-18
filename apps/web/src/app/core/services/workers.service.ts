import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Worker {
  id: string;
  worker_code: string;
  full_name: string;
  phone?: string;
  email?: string;
  worker_type: string;
  specialization?: string;
  employee_id?: string;
  user_id?: string;
  is_available: boolean;
  is_active: boolean;
  last_latitude?: number;
  last_longitude?: number;
  last_location_at?: string;
  created_at: string;
  updated_at: string;
  team_memberships?: any[];
  _count?: { operations: number };
  operations?: any[];
  performance?: any[];
}

export interface WorkerLocation {
  id: string;
  worker_code: string;
  full_name: string;
  worker_type: string;
  last_latitude: number;
  last_longitude: number;
  last_location_at: string;
  is_available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  private readonly api = inject(ApiService);

  getAll(type?: string, available?: boolean): Observable<Worker[]> {
    return this.api.get<Worker[]>('workers', { type, available });
  }

  getById(id: string): Observable<Worker> {
    return this.api.get<Worker>(`workers/${id}`);
  }

  create(data: Partial<Worker>): Observable<Worker> {
    return this.api.post<Worker>('workers', data);
  }

  update(id: string, data: Partial<Worker>): Observable<Worker> {
    return this.api.put<Worker>(`workers/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`workers/${id}`);
  }

  getAllLocations(): Observable<WorkerLocation[]> {
    return this.api.get<WorkerLocation[]>('workers/locations');
  }

  updateLocation(id: string, location: { latitude: number; longitude: number; accuracy?: number }): Observable<any> {
    return this.api.post<any>(`workers/${id}/location`, location);
  }

  getLocationHistory(id: string, date?: string): Observable<any[]> {
    return this.api.get<any[]>(`workers/${id}/location/history`, { date });
  }

  getPerformance(id: string): Observable<any[]> {
    return this.api.get<any[]>(`workers/${id}/performance`);
  }
}
