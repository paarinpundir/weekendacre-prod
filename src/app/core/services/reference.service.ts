import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReferenceOption {
  id: string;
  code: number;
  parent_code?: number;
  name: string;
  description?: string;
  category: string; // water_source, irrigation, pest_management, safety_equipment, document_type, property_state
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  private apiUrl = 'http://172.16.0.108:8081/api/v1/reference';

  constructor(private http: HttpClient) { }

  getOptionsByCategory(category: string): Observable<{ success: boolean; data: ReferenceOption[]; message: string }> {
    return this.http.get<{ success: boolean; data: ReferenceOption[]; message: string }>(
      `${this.apiUrl}/${category}`
    );
  }
}

