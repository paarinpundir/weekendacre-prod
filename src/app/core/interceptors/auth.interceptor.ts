import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import * as AuthActions from '../store/auth/auth.actions';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private store: Store<AppState>,
    private localStorage: LocalStorageService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for auth endpoints and public endpoints
    if (this.isAuthEndpoint(request.url) || this.isPublicEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add auth token to request (only if token exists)
    const token = this.localStorage.getItem('access_token');
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // Only handle 401 errors for authenticated endpoints
        if (error instanceof HttpErrorResponse && error.status === 401 && !this.isPublicEndpoint(request.url)) {
          // Guests have no session. A 401 on a public page must not send them to login.
          if (!request.headers.has('Authorization')) {
            return throwError(() => error);
          }
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/refresh',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/reset-password'
    ];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/api/v1/properties/public',
      '/api/v1/reference/'
    ];
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.localStorage.getItem('refresh_token');
      if (refreshToken) {
        return this.store.select('auth').pipe(
          take(1),
          switchMap(authState => {
            // Dispatch refresh token action (token is read from localStorage in the effect)
            this.store.dispatch(AuthActions.refreshToken());
            
            // Wait for refresh to complete
            return this.refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(token => {
                this.isRefreshing = false;
                return next.handle(this.addToken(request, token));
              })
            );
          })
        );
      } else {
        // No refresh token, logout user
        this.store.dispatch(AuthActions.tokenExpired());
        this.isRefreshing = false;
        return throwError(() => new Error('No refresh token available'));
      }
    }

    // If already refreshing, listen for refresh to complete
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(request, token)))
    );
  }
}
