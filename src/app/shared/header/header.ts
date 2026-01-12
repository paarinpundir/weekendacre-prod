import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthService } from '../../core/services/auth.service';
import { SessionStorageService } from '../../core/services/session-storage.service';
import { User } from '../../core/models/user.model';
import * as AuthActions from '../../core/store/auth/auth.actions';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private store = inject(Store);
  private sessionStorage = inject(SessionStorageService);
  
  constructor(public authService: AuthService, private router: Router) {}

  getUserDisplayName(): string {
    const user = this.authService.getStoredUser();
    if (user) {
      // Handle both camelCase and snake_case from backend
      const firstName = (user as any).first_name || user.firstName || '';
      const lastName = (user as any).last_name || user.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      return name || user.email || 'User';
    }
    return '';
  }

  getDashboardRoute(): string {
    const user = this.authService.getStoredUser();
    if (user) {
      // Check user_type from user object (backend might send user_type or role)
      const userType = (user as any).user_type || user.role || '';
      if (userType === 'partner' || userType === 'Partner') {
        return '/partner/dashboard';
      }
    }
    return '/dashboard';
  }

  logout() {
    // Dispatch logout action to clear sessionStorage via effect
    this.store.dispatch(AuthActions.logout());
  }
}
