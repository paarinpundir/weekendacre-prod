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

  getMyBookings(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }
}

