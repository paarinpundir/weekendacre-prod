import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import * as AuthActions from '../../../core/store/auth/auth.actions';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnDestroy {
  email = '';
  password = '';
  /** API / routing roles: user = member, partner = farm partner, admin = staff */
  userType: 'user' | 'partner' | 'admin' = 'user';
  showPassword = false;
  rememberMe = true;
  errorMessage = '';
  infoMessage = '';
  isLoading = false;

  get emailFieldLabel(): string {
    switch (this.userType) {
      case 'partner':
        return 'Farm partner email';
      case 'admin':
        return 'Staff email';
      default:
        return 'Member email or ID';
    }
  }

  private destroy$ = new Subject<void>();
  private store = inject(Store);

  constructor(private router: Router) {
    // Subscribe to auth state
    this.store.select((state: any) => state.auth)
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState: any) => {
        if (authState.loginError) {
          this.infoMessage = '';
          this.errorMessage = authState.loginError;
          this.isLoading = false;
        } else if (authState.isAuthenticated) {
          // Navigate based on user type
          const user = authState.currentUser;
          const userType = (user as any)?.user_type || (user as any)?.userType || 'user';
          if (userType === 'partner') {
            this.router.navigate(['/partner/dashboard']);
          } else if (userType === 'admin') {
            this.router.navigate(['/admin']);
          } else if (userType === 'guest') {
            this.router.navigate(['/dashboard']); // Guest profile
          } else {
            this.router.navigate(['/dashboard']); // Regular user
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.store.dispatch(AuthActions.login({
      email: this.email,
      password: this.password
    }));
  }

  onForgotPasswordClick(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.infoMessage =
      'Password reset is coming soon. For help, reach out to Weekend Acres support.';
  }

  /** Keeps floating labels up when browsers skip :placeholder-shown (e.g. autofill). */
  isFilled(value: string | null | undefined): boolean {
    return (value ?? '').trim().length > 0;
  }
}