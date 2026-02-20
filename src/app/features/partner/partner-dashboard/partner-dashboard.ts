import { Component, OnInit, OnDestroy, inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, RouterLink, FormsModule],
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
  public authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private cdr = inject(ChangeDetectorRef);
  public router = inject(Router);
  
  // Booking/Rates Management
  selectedBookingProperty: Property | null = null;
  bookingCalendarDate = new Date();
  bookingCalendarDays: (Date | null)[][] = [];
  
  // Date Range Selection
  rangeStartDate: Date | null = null;
  rangeEndDate: Date | null = null;
  
  bookingSettings = {
    price: 0,
    isAvailable: true,
    status: 'available',
    availableUnits: 1
  };

  constructor() {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isOnboarding = this.router.url.includes('/property/onboard');
      }
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getStoredUser();
    this.isOnboarding = this.router.url.includes('/property/onboard');
    
    // Subscribe to raw state and extract properties
    this.store.select((state: any) => {
      const propertyState = state.property;
      if (!propertyState) return [];
      
      const entities = propertyState.entities || {};
      const ids = propertyState.ids || [];
      return ids.map((id: string) => entities[id]).filter((p: Property) => p !== undefined) as Property[];
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((properties: Property[]) => {
        this.properties = properties || [];
        this.cdr.detectChanges();
      });
    
    this.store.select((state: any) => state.property?.loading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => {
        this.loading = loading || false;
      });
    
    this.loadProperties();
  }

  selectBookingProperty(property: Property) {
    this.selectedBookingProperty = property;
    this.generateBookingCalendar();
  }

  generateBookingCalendar() {
    const year = this.bookingCalendarDate.getFullYear();
    const month = this.bookingCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let date = 1;
    let days: (Date | null)[] = [];
    const weeks: (Date | null)[][] = [];

    for (let i = 0; i < startingDay; i++) days.push(null);

    while (date <= daysInMonth) {
      days.push(new Date(year, month, date));
      if (days.length === 7) {
        weeks.push(days);
        days = [];
      }
      date++;
    }
    if (days.length > 0) {
      while (days.length < 7) days.push(null);
      weeks.push(days);
    }
    this.bookingCalendarDays = weeks;
  }

  bookingPrevMonth() {
    this.bookingCalendarDate = new Date(this.bookingCalendarDate.getFullYear(), this.bookingCalendarDate.getMonth() - 1, 1);
    this.generateBookingCalendar();
  }

  bookingNextMonth() {
    this.bookingCalendarDate = new Date(this.bookingCalendarDate.getFullYear(), this.bookingCalendarDate.getMonth() + 1, 1);
    this.generateBookingCalendar();
  }

  toggleCalendarDate(date: Date | null) {
    if (!date) return;
    
    // Reset if both selected or clicking before start
    if ((this.rangeStartDate && this.rangeEndDate) || (this.rangeStartDate && date < this.rangeStartDate)) {
      this.rangeStartDate = date;
      this.rangeEndDate = null;
      return;
    }

    // Set end date if start is selected and click is after start
    if (this.rangeStartDate && !this.rangeEndDate && date >= this.rangeStartDate) {
      this.rangeEndDate = date;
      return;
    }

    // Default: Set start date
    this.rangeStartDate = date;
    this.rangeEndDate = null;
  }

  isSelectedDate(date: Date | null): boolean {
    if (!date) return false;
    
    // Check if it's the start or end date
    if (this.rangeStartDate && date.getTime() === this.rangeStartDate.getTime()) return true;
    if (this.rangeEndDate && date.getTime() === this.rangeEndDate.getTime()) return true;
    
    // Check if inside range
    if (this.rangeStartDate && this.rangeEndDate && date > this.rangeStartDate && date < this.rangeEndDate) return true;
    
    return false;
  }

  saveRates() {
    if (!this.selectedBookingProperty || !this.rangeStartDate) {
      alert("Please select a date range first.");
      return;
    }
    
    const start = this.rangeStartDate;
    const end = this.rangeEndDate || this.rangeStartDate; // Default to single day if no end date
    
    // Generate all dates in range
    const datesToSave: string[] = [];
    let current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      datesToSave.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }

    const total = datesToSave.length;
    let completed = 0;
    let errors = 0;

    datesToSave.forEach(dateStr => {
      const rateData = {
        property_id: this.selectedBookingProperty!.id,
        date: dateStr,
        price: this.bookingSettings.price,
        status: this.bookingSettings.status,
        available_units: this.bookingSettings.availableUnits,
        currency: 'INR'
      };

      this.propertyService.saveDailyRate(rateData).subscribe({
        next: () => {
          completed++;
          if (completed + errors === total) {
            this.finalizeSave(completed, errors);
          }
        },
        error: (err) => {
          console.error(`Failed to save rate for ${dateStr}`, err);
          errors++;
          if (completed + errors === total) {
            this.finalizeSave(completed, errors);
          }
        }
      });
    });
  }

  finalizeSave(success: number, failed: number) {
    if (failed === 0) {
      alert(`Successfully updated rates for ${success} dates.`);
    } else {
      alert(`Updated ${success} dates. Failed to update ${failed} dates.`);
    }
    // Keep selection for reference
  }

  getBookingMonthName(): string {
    return this.bookingCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadProperties() {
    this.loading = true;
    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      return;
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
    // Navigate with 'new' flag to indicate creating a new property (not loading draft)
    this.router.navigate(['/property/onboard'], { queryParams: { new: 'true' } });
  }
  
  continueOnboarding(property: Property) {
    this.router.navigate(['/property/onboard'], { 
      queryParams: { propertyId: property.id, step: property.onboarding_step || 0 }
    });
  }
  
  viewProperty(property: Property) {
    this.router.navigate(['/properties', property.id]);
  }
  
  getShortPropertyId(id: string): string {
    if (!id) return 'N/A';
    return id.substring(0, 8) + '...';
  }
  
  getStepName(step: number | undefined): string {
    if (step === undefined || step === null) return 'Not Started';
    const stepNames = ['Basic Info', 'Land Details', 'Business Details', 'Facilities', 'Water & Safety', 'Review & Submit'];
    return stepNames[step] || `Step ${step + 1}`;
  }
  
  logout() {
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
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.closeUserMenu();
    }
  }

  getDisplayArea(property: Property): string {
    let area = property.total_land_area;
    let unit = (property as any).land_area_unit || 'acres';

    if (!area || area === 0) {
      if (property.onboarding_data) {
        const data = typeof property.onboarding_data === 'string' 
          ? JSON.parse(property.onboarding_data) 
          : property.onboarding_data;
          
        if (data && data.formData && data.formData.total_land_area) {
          area = data.formData.total_land_area;
          unit = data.formData.land_area_unit || unit;
        }
      }
    }
    
    return `${area || 0} ${unit}`;
  }
}
