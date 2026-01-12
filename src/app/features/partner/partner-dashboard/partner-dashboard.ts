import { Component, OnInit, OnDestroy, inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import * as PropertyActions from '../../../core/store/property/property.actions';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { selectAllProperties, selectPropertyLoading } from '../../../core/store/property/property.selectors';

@Component({
  selector: 'app-partner-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './partner-dashboard.html',
  styleUrl: './partner-dashboard.scss'
})
export class PartnerDashboard implements OnInit, OnDestroy {
  properties: Property[] = [];
  loading = false;
  currentUser: any = null;
  activeMenu: 'properties' | 'bookings' | 'dashboard' | 'settings' | 'help' = 'properties';
  showUserMenu = false;
  isOnboarding = false;
  
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private cdr = inject(ChangeDetectorRef);
  
  constructor(private router: Router) {
    // Check if we're in onboarding mode
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isOnboarding = event.url.includes('/property/onboard');
      }
    });
  }
  
  ngOnInit() {
    this.currentUser = this.authService.getStoredUser();
    this.isOnboarding = this.router.url.includes('/property/onboard');
    
    // Subscribe to raw state and extract properties directly
    this.store.select((state: any) => {
      const propertyState = state.property;
      if (!propertyState) {
        console.log('PartnerDashboard: No property state found');
        return [];
      }
      
      // Extract entities from EntityState
      const entities = propertyState.entities || {};
      const ids = propertyState.ids || [];
      const properties = ids.map((id: string) => entities[id]).filter((p: Property) => p !== undefined) as Property[];
      
      console.log('PartnerDashboard: State entities:', entities);
      console.log('PartnerDashboard: State ids:', ids);
      console.log('PartnerDashboard: Extracted properties:', properties.length, properties);
      
      return properties;
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((properties: Property[]) => {
        this.properties = properties || [];
        console.log('PartnerDashboard: Final properties array:', this.properties.length, this.properties);
        this.cdr.detectChanges(); // Force change detection
      });
    
    // Subscribe to loading state
    this.store.select((state: any) => state.property?.loading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => {
        this.loading = loading || false;
        console.log('PartnerDashboard: Loading state:', this.loading);
      });
    
    // Load properties after subscriptions are set up
    this.loadProperties();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadProperties() {
    this.loading = true;
    // Verify user is logged in
    if (!this.authService.isLoggedIn()) {
      console.error('User not logged in');
      this.loading = false;
      return;
    }
    const user = this.authService.getStoredUser();
    if (user) {
      console.log('Loading properties for user:', user.id || user.email);
    }
    this.store.dispatch(PropertyActions.getMyProperties());
  }
  
  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const firstName = (this.currentUser as any).first_name || this.currentUser.firstName || '';
    const lastName = (this.currentUser as any).last_name || this.currentUser.lastName || '';
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName.charAt(0).toUpperCase();
    return (first + last) || this.currentUser.email?.charAt(0).toUpperCase() || 'U';
  }
  
  getUserName(): string {
    if (!this.currentUser) return 'User';
    const firstName = (this.currentUser as any).first_name || this.currentUser.firstName || '';
    const lastName = (this.currentUser as any).last_name || this.currentUser.lastName || '';
    return `${firstName} ${lastName}`.trim() || this.currentUser.email || 'User';
  }
  
  getUserRole(): string {
    if (!this.currentUser) return 'Partner';
    return (this.currentUser as any).user_type || this.currentUser.role || 'Partner';
  }
  
  addNewProperty() {
    this.router.navigate(['/property/onboard']);
  }
  
  continueOnboarding(property: Property) {
    // Navigate to onboarding with property ID to resume
    this.router.navigate(['/property/onboard'], { 
      queryParams: { propertyId: property.id, step: property.onboarding_step || 0 }
    });
  }
  
  viewProperty(property: Property) {
    // Navigate to property detail page
    this.router.navigate(['/properties', property.id]);
  }
  
  getShortPropertyId(id: string): string {
    if (!id) return 'N/A';
    // Show first 8 characters of UUID
    return id.substring(0, 8) + '...';
  }
  
  getStepName(step: number | undefined): string {
    if (step === undefined || step === null) return 'Not Started';
    const stepNames = ['Basic Info', 'Land Details', 'Business Details', 'Facilities', 'Water & Safety', 'Review & Submit'];
    return stepNames[step] || `Step ${step + 1}`;
  }
  
  logout() {
    // Dispatch logout action to clear sessionStorage via effect
    this.store.dispatch(AuthActions.logout());
  }
  
  setActiveMenu(menu: 'properties' | 'bookings' | 'dashboard' | 'settings' | 'help') {
    this.activeMenu = menu;
    if (menu === 'properties') {
      this.loadProperties();
    }
  }
  
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
  
  closeUserMenu() {
    this.showUserMenu = false;
  }
  
  goToProfile() {
    this.closeUserMenu();
    // Navigate to profile page when implemented
    // this.router.navigate(['/partner/profile']);
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.closeUserMenu();
    }
  }
}

