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
  userType: 'user' | 'partner' | 'admin' = 'user';
  errorMessage = '';
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  
  constructor(private router: Router) {
    // Subscribe to auth state
    this.store.select((state: any) => state.auth)
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState: any) => {
        if (authState.loginError) {
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
}

