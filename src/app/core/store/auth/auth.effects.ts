import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { SessionStorageService } from '../../services/session-storage.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sessionStorage = inject(SessionStorageService);

  // Login Effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(response => {
            // Backend returns: { success: true, message: "...", data: { user, access_token, refresh_token } }
            const user = response.data.user;
            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            const expiresIn = 24 * 60 * 60; // 24 hours in seconds
            
            // Don't store here - let loginSuccess$ effect handle it to avoid duplicates
            
            return AuthActions.loginSuccess({
              user: user,
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresIn: expiresIn
            });
          }),
          catchError(error => {
            console.error('Login error:', error);
            const errorMessage = error.error?.error || error.error?.message || error.message || 'Login failed';
            return of(AuthActions.loginFailure({ 
              error: errorMessage
            }));
          })
        )
      )
    )
  );

  // Login Success Effect
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ user, accessToken, refreshToken, expiresIn }) => {
        // Store tokens in sessionStorage (session-only)
        this.sessionStorage.setItem('access_token', accessToken);
        this.sessionStorage.setItem('refresh_token', refreshToken);
        this.sessionStorage.setItem('token_expiry', (Date.now() + expiresIn * 1000).toString());
        this.sessionStorage.setItem('current_user', JSON.stringify(user));

        // Redirect based on user type
        const userType = (user as any).user_type || (user as any).userType || 'user';
        this.redirectBasedOnUserType(userType);
      }),
      mergeMap(({ user }) => {
        // Permissions endpoint is not implemented yet — keep login flowing.
        return of(AuthActions.loadCurrentUserSuccess({ user, permissions: [] }));
      })
    )
  );

  // Registration Effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ email, password, firstName, lastName, phone, userType = 'user' }) =>
        this.authService.register(email, password, firstName, lastName, phone, userType).pipe(
          map(response => {
            // Store tokens in sessionStorage (session-only)
            if (response.data.access_token) {
              this.sessionStorage.setItem('access_token', response.data.access_token);
              this.sessionStorage.setItem('refresh_token', response.data.refresh_token);
              this.sessionStorage.setItem('current_user', JSON.stringify(response.data.user));
              // Set expiry (assuming 24 hours)
              const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
              this.sessionStorage.setItem('token_expiry', (Date.now() + expiresIn).toString());
            }
            return AuthActions.registerSuccess({
              user: response.data.user,
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token,
              message: response.message
            });
          }),
          catchError(error => {
            console.error('Registration error:', error);
            const errorMessage = error.error?.error || error.error?.message || error.message || 'Registration failed';
            return of(AuthActions.registerFailure({ 
              error: errorMessage
            }));
          })
        )
      )
    )
  );

  // Registration Success Effect
  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ user }) => {
        // Navigate based on user type (check both user_type and userType for compatibility)
        const userType = (user as any).user_type || (user as any).userType;
        if (userType === 'partner') {
          this.router.navigate(['/partner/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      })
    ),
    { dispatch: false }
  );

  // Logout Effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(error => 
            of(AuthActions.logoutFailure({ 
              error: error.error?.message || 'Logout failed' 
            }))
          )
        )
      )
    )
  );

  // Logout Success Effect
  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        // Clear sessionStorage
        this.sessionStorage.clear();

        // Redirect to login
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  // Refresh Token Effect
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      mergeMap(() => {
        const refreshToken = this.sessionStorage.getItem('refresh_token');
        if (!refreshToken) {
          return of(AuthActions.tokenExpired());
        }

        return this.authService.refreshToken(refreshToken).pipe(
          map(response => 
            AuthActions.refreshTokenSuccess({
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
              expiresIn: response.expires_in
            })
          ),
          catchError(error => 
            of(AuthActions.refreshTokenFailure({ 
              error: error.error?.message || 'Token refresh failed' 
            }))
          )
        );
      })
    )
  );

  // Refresh Token Success Effect
  refreshTokenSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess),
      tap(({ accessToken, refreshToken, expiresIn }) => {
        // Update tokens in sessionStorage
        this.sessionStorage.setItem('access_token', accessToken);
        this.sessionStorage.setItem('refresh_token', refreshToken);
        this.sessionStorage.setItem('token_expiry', (Date.now() + expiresIn * 1000).toString());
      })
    ),
    { dispatch: false }
  );

  // Load Current User Effect
  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      mergeMap(() => {
        const userStr = this.sessionStorage.getItem('current_user');
        if (!userStr) {
          return of(AuthActions.loadCurrentUserFailure({ error: 'No user found in storage' }));
        }

        const user = JSON.parse(userStr);
        return this.authService.getUserPermissions(user.id).pipe(
          map(permissions => 
            AuthActions.loadCurrentUserSuccess({ user, permissions })
          ),
          catchError(error => 
            of(AuthActions.loadCurrentUserFailure({ 
              error: error.error?.message || 'Failed to load user' 
            }))
          )
        );
      })
    )
  );

  // Update User Profile Effect
  updateUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUserProfile),
      mergeMap(({ userId, updates }) =>
        this.authService.updateUser(userId, updates).pipe(
          map(user => 
            AuthActions.updateUserProfileSuccess({ user })
          ),
          catchError(error => 
            of(AuthActions.updateUserProfileFailure({ 
              error: error.error?.message || 'Profile update failed' 
            }))
          )
        )
      )
    )
  );

  // Update User Profile Success Effect
  updateUserProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUserProfileSuccess),
      tap(({ user }) => {
        // Update user in sessionStorage
        this.sessionStorage.setItem('current_user', JSON.stringify(user));
      })
    ),
    { dispatch: false }
  );

  // Forgot Password Effect
  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      mergeMap(({ email }) =>
        this.authService.forgotPassword(email).pipe(
          map(response => 
            AuthActions.forgotPasswordSuccess({ 
              message: response.message 
            })
          ),
          catchError(error => 
            of(AuthActions.forgotPasswordFailure({ 
              error: error.error?.message || 'Failed to send reset email' 
            }))
          )
        )
      )
    )
  );

  // Reset Password Effect
  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      mergeMap(({ token, newPassword }) =>
        this.authService.resetPassword(token, newPassword).pipe(
          map(response => 
            AuthActions.resetPasswordSuccess({ 
              message: response.message 
            })
          ),
          catchError(error => 
            of(AuthActions.resetPasswordFailure({ 
              error: error.error?.message || 'Password reset failed' 
            }))
          )
        )
      )
    )
  );

  // Initialize Auth Effect
  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeAuth),
      mergeMap(() => {
        const token = this.sessionStorage.getItem('access_token');
        const expiry = this.sessionStorage.getItem('token_expiry');
        
        if (token && expiry && parseInt(expiry) > Date.now()) {
          return of(AuthActions.loadCurrentUser());
        } else {
          // Token expired or missing, clear storage
          this.sessionStorage.clear();
          return of(AuthActions.tokenExpired());
        }
      })
    )
  );

  // Token Expired Effect
  tokenExpired$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.tokenExpired),
      tap(() => {
        // Clear storage and redirect to login
        this.sessionStorage.clear();
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  private redirectBasedOnUserType(userType: string): void {
    switch (userType) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'partner':
        this.router.navigate(['/partner/dashboard']);
        break;
      case 'guest':
        this.router.navigate(['/dashboard']); // Guest profile/dashboard
        break;
      case 'user':
      default:
        this.router.navigate(['/dashboard']); // User dashboard
        break;
    }
  }
}
