import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// Environment config removed - using hardcoded values for now

import { Partner, PartnerOnboardingData } from '../models/partner.model';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private apiUrl = 'http://172.16.0.108:8081/api/v1/partners'; // TODO: Move to config

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('eco_adventure_park_access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Partner Onboarding
  onboardPartner(partnerData: PartnerOnboardingData): Observable<{ partner: Partner; message: string }> {
    return this.http.post<{ partner: Partner; message: string }>(
      `${this.apiUrl}/onboard`,
      partnerData,
      { headers: this.getAuthHeaders() }
    );
  }

  // Get Partner Profile
  getPartnerProfile(partnerId: string): Observable<Partner> {
    return this.http.get<Partner>(
      `${this.apiUrl}/${partnerId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Update Partner Profile
  updatePartnerProfile(partnerId: string, updates: Partial<Partner>): Observable<Partner> {
    return this.http.put<Partner>(
      `${this.apiUrl}/${partnerId}`,
      updates,
      { headers: this.getAuthHeaders() }
    );
  }

  // List Partners (Admin)
  listPartners(filters: {
    page?: number;
    limit?: number;
    status?: string;
    businessType?: string;
    search?: string;
  }): Observable<{ partners: Partner[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.businessType) params.append('business_type', filters.businessType);
    if (filters.search) params.append('search', filters.search);

    return this.http.get<{ partners: Partner[]; total: number; page: number; limit: number }>(
      `${this.apiUrl}?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Approve Partner (Admin)
  approvePartner(partnerId: string, approvedBy: string): Observable<Partner> {
    return this.http.post<Partner>(
      `${this.apiUrl}/${partnerId}/approve`,
      { approved_by: approvedBy },
      { headers: this.getAuthHeaders() }
    );
  }

  // Reject Partner (Admin)
  rejectPartner(partnerId: string, rejectionReason: string, rejectedBy: string): Observable<Partner> {
    return this.http.post<Partner>(
      `${this.apiUrl}/${partnerId}/reject`,
      {
        rejection_reason: rejectionReason,
        rejected_by: rejectedBy
      },
      { headers: this.getAuthHeaders() }
    );
  }

  // Suspend Partner (Admin)
  suspendPartner(partnerId: string, reason: string, suspendedBy: string): Observable<Partner> {
    return this.http.post<Partner>(
      `${this.apiUrl}/${partnerId}/suspend`,
      {
        reason,
        suspended_by: suspendedBy
      },
      { headers: this.getAuthHeaders() }
    );
  }

  // Upload Documents
  uploadDocuments(partnerId: string, files: File[]): Observable<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<{ urls: string[] }>(
      `${this.apiUrl}/${partnerId}/documents`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  // Get Pending Partners (Admin)
  getPendingPartners(): Observable<{ partners: Partner[]; total: number }> {
    return this.http.get<{ partners: Partner[]; total: number }>(
      `${this.apiUrl}/pending`,
      { headers: this.getAuthHeaders() }
    );
  }
}
