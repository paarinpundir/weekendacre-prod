import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Booking {
  id?: string;
  property_id: string;
  user_id?: string;
  check_in: string; // ISO date string
  check_out: string; // ISO date string
  guests: number;
  total_amount: number;
  status?: string;
  payment_status?: string;
  notes?: string;
}

export interface ProduceLine {
  crop_id: string;
  crop_name: string;
  quantity_kg: number;
  unit_price: number;
  line_total: number;
  fulfilment: string;
}

export interface StayRequest {
  property_id: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  stay_facility_id?: string;
  guest_name: string;
  guest_email?: string;
  guest_phone: string;
  notes?: string;
  produce: { crop_id: string; quantity_kg: number; fulfilment: string }[];
}

export interface SavedBooking {
  id: string;
  property_id: string;
  property_name?: string;
  address?: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  guests: number;
  stay_name?: string;
  stay_amount: number;
  total_amount: number;
  guest_name: string;
  guest_email?: string;
  guest_phone: string;
  notes?: string;
  status: string;
  produce_items: ProduceLine[] | string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/bookings`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  createBooking(booking: Booking): Observable<any> {
    return this.http.post(this.apiUrl, booking, { headers: this.getAuthHeaders() });
  }

  createStay(booking: StayRequest): Observable<{ success: boolean; data: SavedBooking }> {
    return this.http.post<{ success: boolean; data: SavedBooking }>(
      `${environment.apiUrl}/api/v1/bookings/public`,
      booking
    );
  }

  getStay(id: string): Observable<{ success: boolean; data: SavedBooking }> {
    return this.http.get<{ success: boolean; data: SavedBooking }>(
      `${environment.apiUrl}/api/v1/bookings/public/${id}`
    );
  }

  getMyBookings(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }
}

