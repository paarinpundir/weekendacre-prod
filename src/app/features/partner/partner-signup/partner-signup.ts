import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';

import * as AuthActions from '../../../core/store/auth/auth.actions';

@Component({
  selector: 'app-partner-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './partner-signup.html',
  styleUrl: './partner-signup.scss'
})
export class PartnerSignup implements OnDestroy {
  name = '';
  phone = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeToTerms = false;
  errorMessage = '';
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  
  constructor(private router: Router) {
    // Subscribe to registration state
    this.store.select((state: any) => state.auth)
      .pipe(
        takeUntil(this.destroy$),
        filter((authState: any) => !!authState)
      )
      .subscribe((authState: any) => {
        if (authState.registrationError) {
          this.errorMessage = authState.registrationError;
          this.isLoading = false;
        } else if (authState.registrationLoading) {
          this.isLoading = true;
        } else if (authState.isAuthenticated && authState.currentUser) {
          // Registration successful, navigation handled by effect
          this.isLoading = false;
        }
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.errorMessage = '';
    
    // Validation
    if (!this.name || !this.phone || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }
    
    if (!this.agreeToTerms) {
      this.errorMessage = 'Please agree to the terms and conditions.';
      return;
    }
    
    // Split name into first and last name
    const nameParts = this.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    this.isLoading = true;
    console.log('Registering partner:', { email: this.email, phone: this.phone, firstName, lastName });
    
    // Dispatch registration action
    this.store.dispatch(AuthActions.register({
      email: this.email,
      password: this.password,
      firstName: firstName,
      lastName: lastName,
      phone: this.phone,
      userType: 'partner'
    }));
  }
}

