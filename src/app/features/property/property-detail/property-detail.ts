import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyExperience } from '../../../core/models/property.model';
import { Subject, takeUntil, skip } from 'rxjs';
import * as PropertyActions from '../../../core/store/property/property.actions';

@Component({
  selector: 'app-property-detail',
  imports: [CommonModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss'
})
export class PropertyDetail implements OnInit, OnDestroy {
  property: Property | null = null;
  loading = true;
  error: string | null = null;
  private currentPropertyId: string | null = null; // Track current loading ID
  
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Use snapshot for initial load to prevent multiple calls
    const propertyId = this.route.snapshot.paramMap.get('id');
    console.log('PropertyDetail ngOnInit - propertyId:', propertyId);
    
    if (propertyId) {
      this.currentPropertyId = propertyId;
      this.loadProperty(propertyId);
    } else {
      this.error = 'Property ID is missing';
      this.loading = false;
    }
    
    // Subscribe to route param changes only if navigating to a different property
    // Skip the first emission (which is the current route) to avoid duplicate load
    this.route.paramMap
      .pipe(
        skip(1), // Skip the initial emission since we already loaded via snapshot
        takeUntil(this.destroy$)
      )
      .subscribe(params => {
        const newPropertyId = params.get('id');
        console.log('Route param changed - newPropertyId:', newPropertyId, 'currentPropertyId:', this.currentPropertyId);
        if (newPropertyId && newPropertyId !== this.currentPropertyId) {
          this.currentPropertyId = newPropertyId;
          this.loadProperty(newPropertyId);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperty(id: string) {
    // Prevent multiple simultaneous loads for the same ID (but allow initial load)
    if (this.loading && this.currentPropertyId === id && this.property !== null) {
      console.log('Skipping duplicate load for property:', id);
      return;
    }
    
    console.log('Loading property:', id);
    this.loading = true;
    this.error = null;
    this.property = null; // Clear previous property
    
    this.propertyService.getProperty(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Only update if this is still the current property being loaded
          if (this.currentPropertyId === id) {
            console.log('Property response received:', response);
            console.log('Response data:', response.data);
            console.log('Response structure:', JSON.stringify(response, null, 2));
            
            // Handle both response structures
            const propertyData = response.data || response;
            if (propertyData && typeof propertyData === 'object') {
              // Merge onboarding_data into property if it exists
              this.property = this.mergeOnboardingData(propertyData);
              this.loading = false;
              console.log('Property loaded successfully:', this.property);
              console.log('Loading state:', this.loading, 'Property exists:', !!this.property);
              // Force change detection
              this.cdr.detectChanges();
            } else {
              console.error('Invalid property data structure:', propertyData);
              this.error = 'Invalid property data received';
              this.loading = false;
              this.cdr.detectChanges();
            }
          } else {
            console.log('Ignoring response for different property. Current:', this.currentPropertyId, 'Response:', id);
          }
        },
        error: (err) => {
          // Only update error if this is still the current property
          if (this.currentPropertyId === id) {
            console.error('Error loading property:', err);
            this.error = err.error?.message || err.message || 'Failed to load property details';
            this.loading = false;
            // Force change detection
            this.cdr.detectChanges();
          } else {
            console.log('Ignoring error for different property. Current:', this.currentPropertyId, 'Error:', id);
          }
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  editProperty() {
    if (this.property) {
      this.router.navigate(['/property/onboard'], {
        queryParams: { propertyId: this.property.id, step: this.property.onboarding_step || 0 }
      });
    }
  }

  getStepName(step: number | undefined): string {
    if (step === undefined || step === null) return 'Not Started';
    const stepNames = ['Basic Info', 'Land Details', 'Business Details', 'Facilities', 'Water & Safety', 'Review & Submit'];
    return stepNames[step] || `Step ${step + 1}`;
  }

  getPropertyLocation(): string {
    if (this.property?.address) {
      const parts = this.property.address.split(',');
      return parts[parts.length - 1]?.trim() || this.property.address;
    }
    return 'Location not specified';
  }

  getMainImage(): string {
    // Use placeholder images for now - in production, use property.images
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop';
  }

  getThumbnailImages(): string[] {
    // Return array of placeholder images (5 thumbnails like Airbnb)
    return [
      'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop'
    ];
  }

  setMainImage(imageUrl: string) {
    // In production, update the main image
    console.log('Setting main image to:', imageUrl);
  }

  showAllPhotos() {
    // In production, open a photo gallery modal
    console.log('Show all photos');
  }

  contactHost() {
    // In production, open contact form or chat
    console.log('Contact host');
  }

  /**
   * Check if an experience is enabled
   * Handles both array format (PropertyExperience[]) and object format ({ experience_farm_walk: true })
   */
  isExperienceEnabled(experiences: PropertyExperience[] | { [key: string]: boolean } | undefined, key: string): boolean {
    if (!experiences) return false;
    
    // If it's an object (from onboarding_data)
    if (!Array.isArray(experiences)) {
      return experiences[key] === true;
    }
    
    // If it's an array (from database), check if any experience matches
    return experiences.some(exp => exp.experience_type === key || exp.name?.toLowerCase().includes(key.replace('experience_', '')));
  }

  /**
   * Merge onboarding_data into property object
   * This ensures all data from onboarding is visible even if property columns are empty
   */
  private mergeOnboardingData(property: Property): Property {
    if (!property.onboarding_data) {
      return property;
    }

    const onboardingData = typeof property.onboarding_data === 'string' 
      ? JSON.parse(property.onboarding_data) 
      : property.onboarding_data;

    // Create merged property object
    const merged: Property = { ...property };

    // Merge formData into property (only if property field is empty/null/0)
    if (onboardingData.formData) {
      const formData = onboardingData.formData;
      
      // Merge form fields only if property field is empty
      if (!merged.owner_name && formData.owner_name) merged.owner_name = formData.owner_name;
      if (!merged.contact_person && formData.contact_person) merged.contact_person = formData.contact_person;
      if (!merged.phone_number && formData.phone_number) merged.phone_number = formData.phone_number;
      if (!merged.whatsapp_number && formData.whatsapp_number) merged.whatsapp_number = formData.whatsapp_number;
      if (!merged.email_id && formData.email_id) merged.email_id = formData.email_id;
      if (!merged.latitude && formData.latitude) merged.latitude = formData.latitude;
      if (!merged.longitude && formData.longitude) merged.longitude = formData.longitude;
      if (!merged.land_area_unit && formData.land_area_unit) merged.land_area_unit = formData.land_area_unit;
      if (!merged.years_in_operation && formData.years_in_operation) merged.years_in_operation = formData.years_in_operation;
      if (!merged.short_description && formData.short_description) merged.short_description = formData.short_description;
      if (!merged.long_description && formData.long_description) merged.long_description = formData.long_description;
    }

    // Merge facility boolean fields from root level of onboarding_data
    // These take precedence over property columns since they're the source of truth during onboarding
    if (onboardingData.crop_rotation_system !== undefined) merged.crop_rotation_system = onboardingData.crop_rotation_system;
    if (onboardingData.is_soil_tested !== undefined) merged.is_soil_tested = onboardingData.is_soil_tested;
    if (onboardingData.farm_boundary !== undefined) merged.farm_boundary = onboardingData.farm_boundary;
    if (onboardingData.parking_space_available !== undefined) merged.parking_space_available = onboardingData.parking_space_available;
    if (onboardingData.shelter_shade_area !== undefined) merged.shelter_shade_area = onboardingData.shelter_shade_area;
    if (onboardingData.cold_storage !== undefined) merged.cold_storage = onboardingData.cold_storage;
    if (onboardingData.storage_room !== undefined) merged.storage_room = onboardingData.storage_room;
    if (onboardingData.kitchen_facility !== undefined) merged.kitchen_facility = onboardingData.kitchen_facility;
    if (onboardingData.toilet_available !== undefined) merged.toilet_available = onboardingData.toilet_available;
    if (onboardingData.toilet_drinking_water !== undefined) merged.toilet_drinking_water = onboardingData.toilet_drinking_water;
    if (onboardingData.electricity_connection !== undefined) merged.electricity_connection = onboardingData.electricity_connection;
    if (onboardingData.backup_power !== undefined) merged.backup_power = onboardingData.backup_power;
    if (onboardingData.waste_management_system !== undefined) merged.waste_management_system = onboardingData.waste_management_system;

    // Merge crops, stay facilities, experiences from onboarding_data
    if (onboardingData.crops && Array.isArray(onboardingData.crops)) {
      merged.crops = onboardingData.crops;
    }
    if (onboardingData.stayFacilities && Array.isArray(onboardingData.stayFacilities)) {
      merged.stay_facilities = onboardingData.stayFacilities;
    }
    if (onboardingData.experiences) {
      merged.experiences = onboardingData.experiences;
    }

    return merged;
  }
}

