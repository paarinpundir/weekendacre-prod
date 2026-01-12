import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
// Environment config removed - using hardcoded values for now

import { environment } from '../../../environments/environment';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '');
  private apiUrl = `${this.baseUrl}/api/v1/auth`; // TODO: Move to config

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('eco_adventure_park_access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Login
  login(email: string, password: string): Observable<{ 
    success: boolean;
    message: string;
    data: {
      user: User; 
      access_token: string; 
      refresh_token: string;
    }
  }> {
    return this.http.post<{ 
      success: boolean;
      message: string;
      data: {
        user: User; 
        access_token: string; 
        refresh_token: string;
      }
    }>(`${this.apiUrl}/login/password`, { email, password });
  }

  // Register
  register(email: string, password: string, firstName: string, lastName: string, phone?: string, userType: string = 'user'): Observable<{ 
    success: boolean;
    message: string;
    data: {
      user: User;
      access_token: string;
      refresh_token: string;
    }
  }> {
    return this.http.post<{ 
      success: boolean;
      message: string;
      data: {
        user: User;
        access_token: string;
        refresh_token: string;
      }
    }>(`${this.apiUrl}/register/password`, { 
      email, 
      password, 
      first_name: firstName, 
      last_name: lastName, 
      phone: phone || '',
      user_type: userType
    });
  }

  // Logout
  logout(): Observable<{ message: string }> {
    const refreshToken = sessionStorage.getItem('eco_adventure_park_refresh_token');
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, { 
      refresh_token: refreshToken 
    });
  }

  // Refresh Token
  refreshToken(refreshToken: string): Observable<{ 
    access_token: string; 
    refresh_token: string; 
    expires_in: number 
  }> {
    return this.http.post<{ 
      access_token: string; 
      refresh_token: string; 
      expires_in: number 
    }>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  // Get Current User
  getCurrentUser(): Observable<{ user: User; permissions: string[] }> {
    return this.http.get<{ user: User; permissions: string[] }>(
      `${this.apiUrl}/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Get User Permissions
  getUserPermissions(userId: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/users/${userId}/permissions`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Update User Profile
  updateUser(userId: string, updates: Partial<User>): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/users/${userId}`,
      updates,
      { headers: this.getAuthHeaders() }
    );
  }

  // Forgot Password
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  // Reset Password
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { 
      token, 
      new_password: newPassword 
    });
  }

  // Validate Token
  validateToken(token: string): Observable<{ valid: boolean; user?: User; permissions?: string[] }> {
    return this.http.post<{ valid: boolean; user?: User; permissions?: string[] }>(
      `${this.apiUrl}/validate`,
      { token }
    );
  }

  // Session storage helpers
  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('eco_adventure_park_access_token');
    const expiry = sessionStorage.getItem('eco_adventure_park_token_expiry');
    return !!(token && expiry && parseInt(expiry) > Date.now());
  }

  getStoredUser(): User | null {
    const userStr = sessionStorage.getItem('eco_adventure_park_current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is admin (helper method)
  isUserAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  }
}

