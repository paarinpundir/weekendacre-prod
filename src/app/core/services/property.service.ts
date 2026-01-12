import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
// Environment config removed - using hardcoded values for now

import { environment } from '../../../environments/environment';

import { 
  Property, 
  Category, 
  PropertyAvailability, 
  PropertyPricing, 
  PropertyReview, 
  PropertySearchRequest, 
  PropertyCreateRequest 
} from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '');
  private apiUrl = `${this.baseUrl}/api/v1/properties`; // TODO: Move to config

  constructor(private http: HttpClient) {}

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
      : `${this.baseUrl}/api/v1/properties/public/${propertyId}`;
    
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
    // Public endpoint - no auth required
    console.log('PropertyService: Fetching all properties from public endpoint');
    return this.http.get<{ success: boolean; data: Property[]; message: string }>(
      `${this.baseUrl}/api/v1/properties/public`
    ).pipe(
      tap(response => console.log('PropertyService: Received response:', response)),
      catchError(error => {
        console.error('PropertyService: Error fetching properties:', error);
        return throwError(() => error);
      })
    );
  }

  saveOnboardingProgress(propertyId: string, step: number, formData: any): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${propertyId}/onboarding`,
      { onboarding_step: step, onboarding_data: formData },
      { headers: this.getAuthHeaders() }
    );
  }

  updateOnboardingProgress(propertyId: string, step: number, data: any): Observable<{ data: any; message: string }> {
    return this.http.patch<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/onboarding`,
      { onboarding_step: step, onboarding_data: data },
      { headers: this.getAuthHeaders() }
    );
  }

  getOnboardingProgress(propertyId: string): Observable<{ data: { step: number; data: any }; message: string }> {
    return this.http.get<{ data: { step: number; data: any }; message: string }>(
      `${this.apiUrl}/${propertyId}/onboarding-progress`,
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

  createInfrastructure(propertyId: string, infrastructure: any): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/infrastructure`,
      infrastructure,
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

  addOrganicInput(propertyId: string, cropId: string, inputCode: number): Observable<{ data: any; message: string }> {
    return this.http.post<{ data: any; message: string }>(
      `${this.apiUrl}/${propertyId}/crops/${cropId}/organic-inputs`,
      { input_code: inputCode },
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

  deleteProperty(propertyId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${propertyId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  listProperties(filters: {
    page?: number;
    limit?: number;
    partnerId?: string;
    categoryId?: string;
    propertyType?: string;
    status?: string;
    city?: string;
    country?: string;
    sortBy?: string;
    sortOrder?: string;
    featured?: boolean;
  }): Observable<{ properties: Property[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.http.get<{ properties: Property[]; total: number; page: number; limit: number }>(
      `${this.apiUrl}?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Property Search
  searchProperties(searchRequest: PropertySearchRequest): Observable<{ 
    properties: Property[]; 
    total: number; 
    suggestions?: string[]; 
    page: number; 
    limit: number; 
  }> {
    return this.http.post<{ 
      properties: Property[]; 
      total: number; 
      suggestions?: string[]; 
      page: number; 
      limit: number; 
    }>(
      `${this.apiUrl}/search`,
      searchRequest,
      { headers: this.getAuthHeaders() }
    );
  }

  // Categories
  listCategories(filters?: { parentId?: string; activeOnly?: boolean }): Observable<Category[]> {
    const params = new URLSearchParams();
    if (filters?.parentId) params.append('parent_id', filters.parentId);
    if (filters?.activeOnly) params.append('active_only', 'true');

    return this.http.get<Category[]>(
      `${this.apiUrl}/categories?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Availability Management
  updateAvailability(propertyId: string, slots: any[]): Observable<{ updated_availability: PropertyAvailability[] }> {
    return this.http.put<{ updated_availability: PropertyAvailability[] }>(
      `${this.apiUrl}/${propertyId}/availability`,
      { slots },
      { headers: this.getAuthHeaders() }
    );
  }

  getAvailability(propertyId: string, startDate: string, endDate: string): Observable<PropertyAvailability[]> {
    return this.http.get<PropertyAvailability[]>(
      `${this.apiUrl}/${propertyId}/availability?start_date=${startDate}&end_date=${endDate}`,
      { headers: this.getAuthHeaders() }
    );
  }

  checkAvailability(propertyId: string, startDate: string, endDate: string, guests: number): Observable<{ 
    available: boolean; 
    total_price: number; 
    available_dates: any[] 
  }> {
    return this.http.get<{ 
      available: boolean; 
      total_price: number; 
      available_dates: any[] 
    }>(
      `${this.apiUrl}/${propertyId}/check-availability?start_date=${startDate}&end_date=${endDate}&guests=${guests}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Pricing Management
  updatePricing(propertyId: string, pricingData: Partial<PropertyPricing>): Observable<PropertyPricing> {
    return this.http.put<PropertyPricing>(
      `${this.apiUrl}/${propertyId}/pricing`,
      pricingData,
      { headers: this.getAuthHeaders() }
    );
  }

  getPricing(propertyId: string, startDate?: string, endDate?: string, guests?: number): Observable<{ 
    pricing: PropertyPricing; 
    calculated_price: number; 
    breakdown: any[] 
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (guests) params.append('guests', guests.toString());

    return this.http.get<{ 
      pricing: PropertyPricing; 
      calculated_price: number; 
      breakdown: any[] 
    }>(
      `${this.apiUrl}/${propertyId}/pricing?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Media Management
  uploadMedia(propertyId: string, files: File[], type: string): Observable<any[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('type', type);

    return this.http.post<any[]>(
      `${this.apiUrl}/${propertyId}/media`,
      formData,
      { headers: this.getFormDataHeaders() }
    );
  }

  deleteMedia(mediaId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/media/${mediaId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  listMedia(propertyId: string, type?: string): Observable<any[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    return this.http.get<any[]>(
      `${this.apiUrl}/${propertyId}/media?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Reviews & Ratings
  addReview(reviewData: Omit<PropertyReview, 'id' | 'createdAt' | 'updatedAt'>): Observable<PropertyReview> {
    return this.http.post<PropertyReview>(
      `${this.apiUrl}/reviews`,
      reviewData,
      { headers: this.getAuthHeaders() }
    );
  }

  getReviews(propertyId: string, page?: number, limit?: number, minRating?: number, sortBy?: string): Observable<{ 
    reviews: PropertyReview[]; 
    total: number; 
    average_rating: number; 
    page: number; 
    limit: number; 
  }> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (minRating) params.append('min_rating', minRating.toString());
    if (sortBy) params.append('sort_by', sortBy);

    return this.http.get<{ 
      reviews: PropertyReview[]; 
      total: number; 
      average_rating: number; 
      page: number; 
      limit: number; 
    }>(
      `${this.apiUrl}/${propertyId}/reviews?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateReview(reviewId: string, updates: Partial<PropertyReview>): Observable<PropertyReview> {
    return this.http.put<PropertyReview>(
      `${this.apiUrl}/reviews/${reviewId}`,
      updates,
      { headers: this.getAuthHeaders() }
    );
  }
}
