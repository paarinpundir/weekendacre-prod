import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import {
  Property,
  PropertyCreateRequest
} from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/properties`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    // Try both key formats for compatibility
    let token = sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('eco_adventure_park_access_token');

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('PropertyService: No access token found in sessionStorage');
    }
    return new HttpHeaders(headers);
  }

  saveDailyRatesBulk(payload: any): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/daily-rates/bulk`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  updateMediaType(propertyId: string, mediaId: string, imageTypeCode: number): Observable<{ success: boolean; data: any; message: string }> {
    return this.http.patch<{ success: boolean; data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/media/${mediaId}`,
      { image_type_code: imageTypeCode },
      { headers: this.getAuthHeaders() }
    );
  }

  private getFormDataHeaders(): HttpHeaders {
    // Try both key formats for compatibility
    let token = sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('eco_adventure_park_access_token');

    if (!token) {
      console.warn('No auth token found for file upload');
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    });
  }

  // Property Management
  createProperty(propertyData: any): Observable<{ success: boolean; message: string; data: Property }> {
    const headers = this.getAuthHeaders();
    console.log('PropertyService: Creating property:', propertyData);
    console.log('PropertyService: Headers:', headers.keys());
    console.log('PropertyService: API URL:', this.apiUrl);

    return this.http.post<{ success: boolean; message: string; data: Property }>(
      this.apiUrl,
      propertyData,
      { headers }
    );
  }

  getProperty(propertyId: string, requireAuth: boolean = false): Observable<{ success: boolean; data: Property; message: string }> {
    // Use public endpoint by default, authenticated endpoint if requireAuth is true
    const url = requireAuth
      ? `${this.apiUrl}/${propertyId}`
      : `${environment.apiUrl}/api/v1/properties/public/${propertyId}`;

    const options = requireAuth
      ? { headers: this.getAuthHeaders() }
      : {};

    return this.http.get<{ success: boolean; data: Property; message: string }>(url, options);
  }

  getMyProperties(): Observable<{ success: boolean; data: Property[]; message: string }> {
    return this.http.get<{ success: boolean; data: Property[]; message: string }>(
      this.apiUrl,
      { headers: this.getAuthHeaders() }
    );
  }

  getLatestDraftProperty(): Observable<{ success: boolean; data: Property; message: string }> {
    return this.http.get<{ success: boolean; data: Property; message: string }>(
      `${this.apiUrl}/draft`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAllProperties(): Observable<{ success: boolean; data: Property[]; message: string }> {
    // Public endpoint - no auth required - only returns approved properties
    console.log('PropertyService: Fetching all properties from public endpoint');
    return this.http.get<{ success: boolean; data: Property[]; message: string }>(
      `${environment.apiUrl}/api/v1/properties/public`
    ).pipe(
      tap(response => console.log('PropertyService: Received response:', response)),
      catchError(error => {
        console.error('PropertyService: Error fetching properties:', error);
        return throwError(() => error);
      })
    );
  }

  getAllPropertiesForAdmin(): Observable<{ success: boolean; data: Property[]; message: string }> {
    // Admin endpoint - requires auth - returns all properties regardless of state
    return this.http.get<{ success: boolean; data: Property[]; message: string }>(
      `${environment.apiUrl}/api/v1/admin/properties/all`,
      { headers: this.getAuthHeaders() }
    );
  }

  saveOnboardingProgress(propertyId: string, step: number, formData: any): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${propertyId}/onboarding`,
      { ...formData, onboarding_step: step },
      { headers: this.getAuthHeaders() }
    );
  }

  updateOnboardingProgress(propertyId: string, step: number, data: any): Observable<{ data: any; message: string }> {
    return this.http.patch<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/onboarding`,
      { ...data, onboarding_step: step },
      { headers: this.getAuthHeaders() }
    );
  }

  updatePropertyState(propertyId: string, state: number, reason?: string): Observable<{ data: any; message: string }> {
    return this.http.patch<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/state`,
      { state, reason },
      { headers: this.getAuthHeaders() }
    );
  }

  getPropertyStateLogs(propertyId: string): Observable<{ data: any[]; message: string }> {
    return this.http.get<{ data: any[]; message: string }>(
      `${this.apiUrl}/${propertyId}/state-logs`,
      { headers: this.getAuthHeaders() }
    );
  }

  addWaterSource(propertyId: string, sourceCode: number): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/water-sources`,
      { source_code: sourceCode },
      { headers: this.getAuthHeaders() }
    );
  }

  addIrrigationSystem(propertyId: string, systemCode: number): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/irrigation-systems`,
      { system_code: systemCode },
      { headers: this.getAuthHeaders() }
    );
  }

  addPestManagement(propertyId: string, methodCode: number): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/pest-management`,
      { method_code: methodCode },
      { headers: this.getAuthHeaders() }
    );
  }

  addSafetyEquipment(propertyId: string, equipmentCode: number): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/safety-equipment`,
      { equipment_code: equipmentCode },
      { headers: this.getAuthHeaders() }
    );
  }

  // Replace-all variants so re-visiting the Water & Irrigation onboarding step can
  // save edits (the add-only endpoints above only fire once, at initial property creation).
  replaceWaterSources(propertyId: string, sourceCodes: number[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${propertyId}/water-sources`,
      { source_codes: sourceCodes },
      { headers: this.getAuthHeaders() }
    );
  }

  replaceIrrigationSystems(propertyId: string, systemCodes: number[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${propertyId}/irrigation-systems`,
      { system_codes: systemCodes },
      { headers: this.getAuthHeaders() }
    );
  }

  replacePestManagement(propertyId: string, methodCodes: number[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${propertyId}/pest-management`,
      { method_codes: methodCodes },
      { headers: this.getAuthHeaders() }
    );
  }

  replaceSafetyEquipment(propertyId: string, equipmentCodes: number[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${propertyId}/safety-equipment`,
      { equipment_codes: equipmentCodes },
      { headers: this.getAuthHeaders() }
    );
  }

  createStaff(propertyId: string, staff: any): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/staff`,
      staff,
      { headers: this.getAuthHeaders() }
    );
  }

  // Crops Management
  addCrop(propertyId: string, crop: any): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/crops`,
      crop,
      { headers: this.getAuthHeaders() }
    );
  }

  replaceCrops(propertyId: string, crops: any[]): Observable<{ data: any; message: string }> {
    return this.http.put<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/crops`,
      crops,
      { headers: this.getAuthHeaders() }
    );
  }

  addOrganicInput(propertyId: string, cropId: string, inputCode: number): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/crops/${cropId}/organic-inputs`,
      { input_code: inputCode },
      { headers: this.getAuthHeaders() }
    );
  }

  // Stay Facilities Management
  addStayFacility(propertyId: string, facility: any): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/stay-facilities`,
      facility,
      { headers: this.getAuthHeaders() }
    );
  }

  replaceStayFacilities(propertyId: string, facilities: any[]): Observable<{ data: any; message: string }> {
    return this.http.put<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/stay-facilities`,
      facilities,
      { headers: this.getAuthHeaders() }
    );
  }

  // Experiences Management
  addExperience(propertyId: string, exp: any): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/experiences`,
      exp,
      { headers: this.getAuthHeaders() }
    );
  }

  replaceExperiences(propertyId: string, exps: any[]): Observable<{ data: any; message: string }> {
    return this.http.put<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/experiences`,
      exps,
      { headers: this.getAuthHeaders() }
    );
  }

  updateProperty(propertyId: string, updates: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(
      `${this.apiUrl}/${propertyId}`,
      updates,
      { headers: this.getAuthHeaders() }
    );
  }

  // Media Management
  uploadMedia(propertyId: string, files: File[], type: string): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('type', type);

    // Backend returns { success: boolean, data: PropertyImage[], message: string }
    return this.http.post<{ success: boolean; data: any[]; message: string }>(
      `${this.apiUrl}/${propertyId}/media`,
      formData,
      { headers: this.getFormDataHeaders() }
    ).pipe(
      map(response => {
        // Return the data array directly for easier handling
        return response.data || response;
      }),
      tap(response => console.log('Upload media response:', response)),
      catchError(error => {
        console.error('Error uploading media:', error);
        return throwError(() => error);
      })
    );
  }

  saveDailyRate(rateData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/daily-rates`,
      rateData,
      { headers: this.getAuthHeaders() }
    );
  }

  getDailyRates(propertyId: string, startDate: string, endDate: string): Observable<{ success: boolean; data: any[]; message: string }> {
    return this.http.get<{ success: boolean; data: any[]; message: string }>(
      `${this.apiUrl}/daily-rates?propertyId=${propertyId}&startDate=${startDate}&endDate=${endDate}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
