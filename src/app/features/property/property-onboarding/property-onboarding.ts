import { Component, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, distinctUntilChanged } from 'rxjs';

import { PropertyService } from '../../../core/services/property.service';
import { ReferenceService, ReferenceOption } from '../../../core/services/reference.service';
import * as PropertyActions from '../../../core/store/property/property.actions';
import { Property, PropertyCreateRequest } from '../../../core/models/property.model';
import { OnboardingSidebar, StepInfo } from './onboarding-sidebar/onboarding-sidebar';

@Component({
  selector: 'app-property-onboarding',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnboardingSidebar],
  templateUrl: './property-onboarding.html',
  styleUrl: './property-onboarding.scss',
  encapsulation: ViewEncapsulation.None
})
export class PropertyOnboarding implements OnInit, OnDestroy {
  currentStep = 0;
  totalSteps = 10; // 0: Basic Info, 1: Land Details, 2: Business Details, 3: Facilities, 4: Staff & Team, 5: Additional Info, 6: Crops, 7: Stay Facilities, 8: Experiences, 9: Photos/Media
  currentPropertyId: string | null = null; // Track if we're editing an existing property
  
  propertyForm!: FormGroup;
  
  // Reference data
  waterSources: ReferenceOption[] = [];
  irrigationSystems: ReferenceOption[] = [];
  pestManagementMethods: ReferenceOption[] = [];
  safetyEquipment: ReferenceOption[] = [];
  facilities: ReferenceOption[] = [];
  propertyStates: ReferenceOption[] = [];
  farmTypes: ReferenceOption[] = [];
  organicInputs: ReferenceOption[] = [];
  experienceTypes: ReferenceOption[] = [];
  imageTypes: ReferenceOption[] = [];
  
  selectedWaterSources: number[] = [];
  selectedIrrigationSystems: number[] = [];
  selectedPestManagement: number[] = [];
  selectedSafetyEquipment: number[] = [];
  selectedFacilities: number[] = [];
  selectedOrganicInputs: number[] = [];
  
  // Dynamic arrays for crops, stay facilities, experiences
  crops: any[] = [];
  stayFacilities: any[] = [];
  experiences: any[] = [];
  uploadedImages: any[] = []; // For photos/media uploads
  
  // Organic inputs selected for each crop (index -> array of codes)
  cropOrganicInputs: { [key: number]: number[] } = {};
  
  // File upload
  proofOfOwnershipFile: File | null = null;
  proofOfOwnershipPreview: string | null = null;
  isDragging = false;
  
  // Room types
  roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'dormitory', label: 'Dormitory' },
    { value: 'cottage', label: 'Cottage' },
    { value: 'tent', label: 'Tent' }
  ];
  
  // Land area units
  landAreaUnits = [
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'bigha', label: 'Bigha' },
    { value: 'sqft', label: 'Square Feet' }
  ];
  
  // Payment preferences
  paymentPreferences = [
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' }
  ];
  
  ownershipTypes = [
    { value: 'owned', label: 'Owned' },
    { value: 'leased', label: 'Leased' },
    { value: 'rented', label: 'Rented' }
  ];
  
  isSubmitting = false;
  errorMessage = '';
  
  // Steps information for sidebar
  stepsList: StepInfo[] = [];
  
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private propertyService = inject(PropertyService);
  private referenceService = inject(ReferenceService);
  
  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {}
  
  ngOnInit() {
    // Check if we're resuming an existing property onboarding
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('propertyId');
    const step = urlParams.get('step');
    
    if (propertyId) {
      this.currentPropertyId = propertyId;
      if (step) {
        this.currentStep = parseInt(step, 10);
      }
    }
    
    this.initializeForm();
    this.loadReferenceData();
    this.initializeSteps();
    
    // First, try to get the latest draft property from the backend
    // This ensures we always use the most recent draft, not just what's in localStorage
    this.propertyService.getLatestDraftProperty().subscribe({
      next: (response) => {
        if (response.data && response.data.id) {
          // Found a draft property in the database
          console.log('Found draft property in database:', response.data.id);
          this.currentPropertyId = response.data.id;
          localStorage.setItem('current_onboarding_property_id', this.currentPropertyId);
          
          // Restore the onboarding step from the database
          if (response.data.onboarding_step !== undefined) {
            this.currentStep = response.data.onboarding_step;
          }
          
          // Load the full property data
          this.loadPropertyFromDB(this.currentPropertyId);
        } else {
          // No draft property found, check localStorage
          this.checkLocalStorageForProperty();
        }
      },
      error: (err) => {
        // Error getting draft property, check localStorage as fallback
        console.warn('Error getting draft property, checking localStorage:', err);
        this.checkLocalStorageForProperty();
      }
    });
    
    // Subscribe to property state changes
    this.store.select((state: any) => state.property)
      .pipe(
        takeUntil(this.destroy$),
        filter((state: any) => !!state),
        distinctUntilChanged((prev, curr) => 
          prev.createSuccess === curr.createSuccess && 
          prev.createError === curr.createError &&
          prev.createdProperty?.id === curr.createdProperty?.id
        )
      )
      .subscribe((propertyState: any) => {
        console.log('PropertyOnboarding: State changed:', {
          isSubmitting: this.isSubmitting,
          createSuccess: propertyState.createSuccess,
          createError: propertyState.createError,
          hasCreatedProperty: !!propertyState.createdProperty
        });
        
        // Only handle if we're currently submitting
        if (this.isSubmitting) {
          if (propertyState.createSuccess && propertyState.createdProperty) {
            console.log('PropertyOnboarding: Property created, handling success');
            this.handlePropertyCreated(propertyState.createdProperty);
          } else if (propertyState.createError) {
            console.log('PropertyOnboarding: Property creation failed:', propertyState.createError);
            this.handlePropertyError(propertyState.createError);
          }
        }
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  handlePropertyCreated(property: Property) {
    const propertyId = property.id;
    this.currentPropertyId = propertyId; // Track the property ID
    localStorage.setItem('current_onboarding_property_id', propertyId);
    console.log('Property created successfully:', property);
    this.isSubmitting = false;
    
    // Save complete progress first (includes all form data, crops, facilities, experiences, images)
    this.saveProgress();
    
    // Add water sources
    this.selectedWaterSources.forEach(code => {
      this.store.dispatch(PropertyActions.addWaterSource({ propertyId, sourceCode: code }));
    });
    
    // Add irrigation systems
    this.selectedIrrigationSystems.forEach(code => {
      this.store.dispatch(PropertyActions.addIrrigationSystem({ propertyId, systemCode: code }));
    });
    
    // Add pest management
    this.selectedPestManagement.forEach(code => {
      this.store.dispatch(PropertyActions.addPestManagement({ propertyId, methodCode: code }));
    });
    
    // Add safety equipment
    this.selectedSafetyEquipment.forEach(code => {
      this.store.dispatch(PropertyActions.addSafetyEquipment({ propertyId, equipmentCode: code }));
    });
    
    // Save additional data (crops, stay facilities, photos) with a delay
    setTimeout(() => {
      // Save crops
      if (this.crops.length > 0) {
        this.saveCrops(propertyId);
      }
      
      // Save stay facilities
      if (this.stayFacilities.length > 0) {
        this.saveStayFacilities(propertyId);
      }
      
      // Upload photos
      if (this.uploadedImages.length > 0) {
        this.uploadPropertyPhotos();
      }
      
      // Upload proof of ownership if available
      if (this.proofOfOwnershipFile) {
        this.uploadProofOfOwnership(this.proofOfOwnershipFile);
      }
      
      // Show success message and redirect
      alert('Property created successfully! All data has been saved.');
      this.router.navigate(['/partner/properties']);
    }, 1000);
    
    // Clear saved progress on successful submission
    this.clearSavedProgress();
    
    // Reset success state to prevent re-triggering
    this.store.dispatch(PropertyActions.resetPropertySuccessStates());
    
    // Navigate to partner dashboard after successful creation
    setTimeout(() => {
      this.router.navigate(['/partner/dashboard']);
    }, 1000);
  }
  
  handlePropertyError(error: string) {
    console.error('Error creating property:', error);
    this.errorMessage = error;
    this.isSubmitting = false;
    // Clear error after showing it
    setTimeout(() => {
      this.store.dispatch(PropertyActions.clearPropertyErrors());
    }, 5000);
  }
  
  loadSavedProgress() {
    const savedData = localStorage.getItem('property_onboarding_draft');
    if (savedData) {
      try {
        const draft = JSON.parse(savedData);
        
        // Restore form values (exclude facility fields - they're derived from selectedFacilities)
        if (draft.formData) {
          const formData = { ...draft.formData };
          // Remove facility boolean fields from formData if they exist
          const facilityFields = [
            'crop_rotation_system', 'is_soil_tested', 'farm_boundary', 'parking_space_available',
            'shelter_shade_area', 'cold_storage', 'storage_room', 'kitchen_facility',
            'toilet_available', 'toilet_drinking_water', 'electricity_connection',
            'backup_power', 'waste_management_system'
          ];
          facilityFields.forEach(field => delete formData[field]);
          this.propertyForm.patchValue(formData);
        }
        
        // Restore selections
        this.selectedWaterSources = draft.selectedWaterSources || [];
        this.selectedIrrigationSystems = draft.selectedIrrigationSystems || [];
        this.selectedPestManagement = draft.selectedPestManagement || [];
        this.selectedSafetyEquipment = draft.selectedSafetyEquipment || [];
        
        // Restore selectedFacilities from array, or derive from boolean fields if array doesn't exist
        if (draft.selectedFacilities && Array.isArray(draft.selectedFacilities)) {
          this.selectedFacilities = draft.selectedFacilities;
        } else {
          // Fallback: derive from boolean fields at root level
          this.selectedFacilities = [];
          if (draft.crop_rotation_system) this.selectedFacilities.push(701);
          if (draft.is_soil_tested) this.selectedFacilities.push(702);
          if (draft.farm_boundary) this.selectedFacilities.push(703);
          if (draft.parking_space_available) this.selectedFacilities.push(704);
          if (draft.shelter_shade_area) this.selectedFacilities.push(705);
          if (draft.cold_storage) this.selectedFacilities.push(706);
          if (draft.storage_room) this.selectedFacilities.push(707);
          if (draft.kitchen_facility) this.selectedFacilities.push(708);
          if (draft.toilet_available) this.selectedFacilities.push(709);
          if (draft.toilet_drinking_water) this.selectedFacilities.push(710);
          if (draft.electricity_connection) this.selectedFacilities.push(711);
          if (draft.backup_power) this.selectedFacilities.push(712);
          if (draft.waste_management_system) this.selectedFacilities.push(713);
        }
        
        // Restore crops, stay facilities, experiences if saved
        if (draft.crops) {
          this.crops = draft.crops;
        }
        if (draft.cropOrganicInputs) {
          this.cropOrganicInputs = draft.cropOrganicInputs;
        }
        if (draft.stayFacilities) {
          this.stayFacilities = draft.stayFacilities;
        }
        if (draft.uploadedImages) {
          // Restore image metadata (but not file objects - user will need to re-upload)
          this.uploadedImages = draft.uploadedImages.map((img: any) => ({
            name: img.name,
            typeCode: img.typeCode,
            preview: img.preview,
            file: null // File objects can't be serialized, user will need to re-upload
          }));
        }
        if (draft.experiences) {
          // Restore experience checkboxes
          Object.keys(draft.experiences).forEach(key => {
            const control = this.propertyForm.get(key);
            if (control) {
              control.setValue(draft.experiences[key]);
            }
          });
        }
        
        // Restore current step if saved
        if (draft.currentStep !== undefined) {
          this.currentStep = draft.currentStep;
        } else {
          // Determine the last completed step
          const lastStep = this.determineLastCompletedStep(draft.formData);
          if (lastStep < this.totalSteps - 1) {
            this.currentStep = lastStep + 1; // Start from next incomplete step
          } else {
            this.currentStep = lastStep; // If all steps completed, show review
          }
        }
        
        // Update steps accessibility after loading
        this.updateStepsAccessibility();
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }
  
  determineLastCompletedStep(formData: any): number {
    // Step 0: Basic Info
    if (!formData?.property_name || !formData?.address) {
      return -1;
    }
    
    // Step 1: Land Details
    if (!formData?.total_land_area || !formData?.ownership_type) {
      return 0;
    }
    
    // Step 2: Business Details (all optional, so if step 1 is done, step 2 is considered accessible)
    // Step 3: Facilities (all optional)
    // Step 4: Water/Irrigation (all optional)
    
    // If we have data beyond step 1, user can access all optional steps
    // Return the last step they were on (check if they have any data in later steps)
    if (formData?.gst_number || formData?.pan_number || formData?.aadhar_number) {
      return 2; // They filled business details
    }
    
    return 1; // They completed at least land details
  }
  
  saveProgress() {
    // Map selectedFacilities to boolean fields for backend compatibility
    const facilityBooleans = {
      crop_rotation_system: this.selectedFacilities.includes(701),
      is_soil_tested: this.selectedFacilities.includes(702),
      farm_boundary: this.selectedFacilities.includes(703),
      parking_space_available: this.selectedFacilities.includes(704),
      shelter_shade_area: this.selectedFacilities.includes(705),
      cold_storage: this.selectedFacilities.includes(706),
      storage_room: this.selectedFacilities.includes(707),
      kitchen_facility: this.selectedFacilities.includes(708),
      toilet_available: this.selectedFacilities.includes(709),
      toilet_drinking_water: this.selectedFacilities.includes(710),
      electricity_connection: this.selectedFacilities.includes(711),
      backup_power: this.selectedFacilities.includes(712),
      waste_management_system: this.selectedFacilities.includes(713)
    };

    // Get form value and exclude facility boolean fields (they're derived from selectedFacilities)
    const formValue = { ...this.propertyForm.value };
    const facilityFields = [
      'crop_rotation_system', 'is_soil_tested', 'farm_boundary', 'parking_space_available',
      'shelter_shade_area', 'cold_storage', 'storage_room', 'kitchen_facility',
      'toilet_available', 'toilet_drinking_water', 'electricity_connection',
      'backup_power', 'waste_management_system'
    ];
    facilityFields.forEach(field => delete formValue[field]);

    const draft = {
      formData: formValue,
      selectedWaterSources: this.selectedWaterSources,
      selectedIrrigationSystems: this.selectedIrrigationSystems,
      selectedPestManagement: this.selectedPestManagement,
      selectedSafetyEquipment: this.selectedSafetyEquipment,
      selectedFacilities: this.selectedFacilities, // Keep array for UI state
      // Add boolean fields for backend compatibility
      ...facilityBooleans,
      crops: this.crops,
      cropOrganicInputs: this.cropOrganicInputs,
      stayFacilities: this.stayFacilities,
      experiences: {
        experience_farm_walk: this.propertyForm.get('experience_farm_walk')?.value || false,
        experience_vegetable_harvesting: this.propertyForm.get('experience_vegetable_harvesting')?.value || false,
        experience_animal_interaction: this.propertyForm.get('experience_animal_interaction')?.value || false,
        experience_organic_farming_workshop: this.propertyForm.get('experience_organic_farming_workshop')?.value || false,
        experience_composting_demo: this.propertyForm.get('experience_composting_demo')?.value || false,
        experience_pottery: this.propertyForm.get('experience_pottery')?.value || false,
        experience_nature_trail: this.propertyForm.get('experience_nature_trail')?.value || false,
        experience_rural_games: this.propertyForm.get('experience_rural_games')?.value || false,
        experience_bonfire: this.propertyForm.get('experience_bonfire')?.value || false,
        experience_outdoor_seating: this.propertyForm.get('experience_outdoor_seating')?.value || false,
        experience_picnic_spots: this.propertyForm.get('experience_picnic_spots')?.value || false,
        experience_kids_activities: this.propertyForm.get('experience_kids_activities')?.value || false
      },
      uploadedImages: this.uploadedImages.map(img => ({
        name: img.name,
        typeCode: img.typeCode,
        preview: img.preview // Keep preview for UI, but don't save file object
      })),
      proofOfOwnershipFile: this.proofOfOwnershipFile ? {
        name: this.proofOfOwnershipFile.name,
        size: this.proofOfOwnershipFile.size,
        type: this.proofOfOwnershipFile.type
      } : null,
      currentStep: this.currentStep,
      savedAt: new Date().toISOString()
    };
    
    // Save to localStorage as backup
    try {
      localStorage.setItem('property_onboarding_draft', JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    
    // If we have a property ID, save to database
    if (this.currentPropertyId) {
      this.propertyService.saveOnboardingProgress(
        this.currentPropertyId,
        this.currentStep,
        draft
      ).subscribe({
        next: () => {
          console.log('Onboarding progress saved to database');
          // Also save crops, stay facilities, and experiences separately
          this.saveAdditionalData();
        },
        error: (err) => {
          console.error('Failed to save onboarding progress:', err);
          // If property doesn't exist (404), clear the invalid ID and create a new one
          if (err.status === 404 || err.status === 400) {
            console.warn('Property not found, clearing invalid ID and creating new property');
            this.currentPropertyId = null;
            localStorage.removeItem('current_onboarding_property_id');
            // Create a draft property if we have minimum data
            if (this.propertyForm.get('property_name')?.value && this.propertyForm.get('address')?.value) {
              this.createDraftProperty();
            }
          }
        }
      });
    } else {
      // If no property ID yet, create a draft property to save progress
      // Only create if we have at least basic info filled
      if (this.propertyForm.get('property_name')?.value && this.propertyForm.get('address')?.value) {
        this.createDraftProperty();
      }
    }
    
    this.updateStepsAccessibility();
  }

  // Save additional data (crops, stay facilities, experiences) separately
  saveAdditionalData() {
    if (!this.currentPropertyId) {
      return;
    }

    // Save crops
    if (this.crops.length > 0) {
      this.saveCrops(this.currentPropertyId);
    }

    // Save stay facilities (when API is ready)
    if (this.stayFacilities.length > 0) {
      this.saveStayFacilities(this.currentPropertyId);
    }

    // Save experiences (when API is ready)
    // Experiences are already saved in onboarding_data, but can be saved separately if needed
  }
  
  createDraftProperty() {
    // Don't create if already creating
    if (this.isSubmitting) {
      return;
    }
    
    const formValue = this.propertyForm.value;
    const propertyData: any = {
      property_name: formValue.property_name || 'Draft Property',
      address: formValue.address || '',
      total_land_area: formValue.total_land_area || 0,
      ownership_type: formValue.ownership_type || 'owned',
      state: 601, // Draft state
      onboarding_step: this.currentStep,
    };
    
    // Only create if we have minimum required data
    if (!propertyData.property_name || !propertyData.address) {
      return;
    }
    
    this.store.dispatch(PropertyActions.createProperty({ propertyData }));
    
    // Subscribe to property creation to get the ID
    this.store.select((state: any) => state.property)
      .pipe(
        takeUntil(this.destroy$),
        filter((state: any) => state.createdProperty && !this.currentPropertyId)
      )
      .subscribe((propertyState: any) => {
        if (propertyState.createdProperty) {
          this.currentPropertyId = propertyState.createdProperty.id;
          if (this.currentPropertyId) {
            localStorage.setItem('current_onboarding_property_id', this.currentPropertyId);
          }
          // Now save the complete progress
          this.saveProgress();
        }
      });
  }
  
  loadPropertyFromDB(propertyId: string) {
    this.propertyService.getProperty(propertyId).subscribe({
      next: (response) => {
        const property = response.data;
        if (property.onboarding_step !== undefined) {
          this.currentStep = property.onboarding_step;
        }
        if (property.onboarding_data) {
          const data = typeof property.onboarding_data === 'string' 
            ? JSON.parse(property.onboarding_data) 
            : property.onboarding_data;
          
          // Restore form values (exclude facility fields - they're derived from selectedFacilities)
          if (data.formData) {
            const formData = { ...data.formData };
            // Remove facility boolean fields from formData if they exist
            const facilityFields = [
              'crop_rotation_system', 'is_soil_tested', 'farm_boundary', 'parking_space_available',
              'shelter_shade_area', 'cold_storage', 'storage_room', 'kitchen_facility',
              'toilet_available', 'toilet_drinking_water', 'electricity_connection',
              'backup_power', 'waste_management_system'
            ];
            facilityFields.forEach(field => delete formData[field]);
            this.propertyForm.patchValue(formData);
          }
          
          // Restore selections
          this.selectedWaterSources = data.selectedWaterSources || [];
          this.selectedIrrigationSystems = data.selectedIrrigationSystems || [];
          this.selectedPestManagement = data.selectedPestManagement || [];
          this.selectedSafetyEquipment = data.selectedSafetyEquipment || [];
          
          // Restore selectedFacilities from array, or derive from boolean fields if array doesn't exist
          if (data.selectedFacilities && Array.isArray(data.selectedFacilities)) {
            this.selectedFacilities = data.selectedFacilities;
          } else {
            // Fallback: derive from boolean fields at root level
            this.selectedFacilities = [];
            if (data.crop_rotation_system) this.selectedFacilities.push(701);
            if (data.is_soil_tested) this.selectedFacilities.push(702);
            if (data.farm_boundary) this.selectedFacilities.push(703);
            if (data.parking_space_available) this.selectedFacilities.push(704);
            if (data.shelter_shade_area) this.selectedFacilities.push(705);
            if (data.cold_storage) this.selectedFacilities.push(706);
            if (data.storage_room) this.selectedFacilities.push(707);
            if (data.kitchen_facility) this.selectedFacilities.push(708);
            if (data.toilet_available) this.selectedFacilities.push(709);
            if (data.toilet_drinking_water) this.selectedFacilities.push(710);
            if (data.electricity_connection) this.selectedFacilities.push(711);
            if (data.backup_power) this.selectedFacilities.push(712);
            if (data.waste_management_system) this.selectedFacilities.push(713);
          }
        } else {
          // Load from form values if no onboarding_data
          this.propertyForm.patchValue({
            property_name: property.property_name,
            address: property.address,
            latitude: property.latitude,
            longitude: property.longitude,
            total_land_area: property.total_land_area,
            ownership_type: property.ownership_type,
            gst_number: property.gst_number,
            pan_number: property.pan_number,
            aadhar_number: property.aadhar_number,
            crop_rotation_system: property.crop_rotation_system,
            is_soil_tested: property.is_soil_tested,
            farm_boundary: property.farm_boundary,
            parking_space_available: property.parking_space_available,
            shelter_shade_area: property.shelter_shade_area,
            cold_storage: property.cold_storage,
            storage_room: property.storage_room,
            kitchen_facility: property.kitchen_facility,
            toilet_available: property.toilet_available,
            toilet_drinking_water: property.toilet_drinking_water,
            electricity_connection: property.electricity_connection,
            backup_power: property.backup_power,
            waste_management_system: property.waste_management_system
          });
          
          // Restore selected facilities from boolean fields
          this.selectedFacilities = [];
          if (property.crop_rotation_system) this.selectedFacilities.push(701);
          if (property.is_soil_tested) this.selectedFacilities.push(702);
          if (property.farm_boundary) this.selectedFacilities.push(703);
          if (property.parking_space_available) this.selectedFacilities.push(704);
          if (property.shelter_shade_area) this.selectedFacilities.push(705);
          if (property.cold_storage) this.selectedFacilities.push(706);
          if (property.storage_room) this.selectedFacilities.push(707);
          if (property.kitchen_facility) this.selectedFacilities.push(708);
          if (property.toilet_available) this.selectedFacilities.push(709);
          if (property.toilet_drinking_water) this.selectedFacilities.push(710);
          if (property.electricity_connection) this.selectedFacilities.push(711);
          if (property.backup_power) this.selectedFacilities.push(712);
          if (property.waste_management_system) this.selectedFacilities.push(713);
        }
        this.updateStepsAccessibility();
      },
      error: (err) => {
        console.error('Failed to load property:', err);
        // If property not found, clear the invalid ID and load from localStorage
        if (err.status === 404) {
          console.warn('Property not found (404), clearing invalid ID and loading from localStorage');
          this.currentPropertyId = null;
          localStorage.removeItem('current_onboarding_property_id');
          this.loadSavedProgress();
        }
      }
    });
  }
  
  clearSavedProgress() {
    localStorage.removeItem('property_onboarding_draft');
  }
  
  initializeForm() {
    // Try to load saved form data first
    const savedData = localStorage.getItem('property_onboarding_draft');
    let savedFormData: any = {};
    
    if (savedData) {
      try {
        const draft = JSON.parse(savedData);
        savedFormData = draft.formData || {};
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }
    
    this.propertyForm = this.fb.group({
      // Step 0: Basic Info
      property_name: [savedFormData.property_name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      owner_name: [savedFormData.owner_name || '', [Validators.required, Validators.minLength(2)]],
      contact_person: [savedFormData.contact_person || '', [Validators.required, Validators.minLength(2)]],
      phone_number: [savedFormData.phone_number || '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      whatsapp_number: [savedFormData.whatsapp_number || '', [Validators.pattern(/^[0-9]{10}$/)]],
      email_id: [savedFormData.email_id || '', [Validators.required, Validators.email]],
      address: [savedFormData.address || '', [Validators.required, Validators.minLength(10)]],
      latitude: [savedFormData.latitude || null],
      longitude: [savedFormData.longitude || null],
      
      // Step 1: Land Details
      total_land_area: [savedFormData.total_land_area || null, [Validators.required, Validators.min(0.1)]],
      land_area_unit: [savedFormData.land_area_unit || 'acres', Validators.required],
      years_in_operation: [savedFormData.years_in_operation || null, [Validators.min(0)]],
      ownership_type: [savedFormData.ownership_type || 'owned', Validators.required],
      proof_of_ownership: [savedFormData.proof_of_ownership || ''],
      
      // Step 2: Business Details
      gst_number: [savedFormData.gst_number || ''],
      pan_number: [savedFormData.pan_number || ''],
      aadhar_number: [savedFormData.aadhar_number || ''],
      
      // Note: Facility boolean fields are NOT stored in the form
      // They are derived from selectedFacilities array and saved at root level of onboarding_data
      
      // Step 4: Staff & Team Details
      num_full_time_staff: [savedFormData.num_full_time_staff || 0, [Validators.min(0)]],
      num_part_time_staff: [savedFormData.num_part_time_staff || 0, [Validators.min(0)]],
      hospitality_trained_staff: [savedFormData.hospitality_trained_staff || false],
      english_speaking_farm_guide: [savedFormData.english_speaking_farm_guide || false],
      cooking_staff_available: [savedFormData.cooking_staff_available || false],
      
      // Step 5: Additional Information
      constraints: [savedFormData.constraints || ''],
      limitations: [savedFormData.limitations || ''],
      
      // Step 8: Experiences (checkboxes)
      experience_farm_walk: [savedFormData.experience_farm_walk || false],
      experience_vegetable_harvesting: [savedFormData.experience_vegetable_harvesting || false],
      experience_animal_interaction: [savedFormData.experience_animal_interaction || false],
      experience_organic_farming_workshop: [savedFormData.experience_organic_farming_workshop || false],
      experience_composting_demo: [savedFormData.experience_composting_demo || false],
      experience_pottery: [savedFormData.experience_pottery || false],
      experience_nature_trail: [savedFormData.experience_nature_trail || false],
      experience_rural_games: [savedFormData.experience_rural_games || false],
      experience_bonfire: [savedFormData.experience_bonfire || false],
      experience_outdoor_seating: [savedFormData.experience_outdoor_seating || false],
      experience_picnic_spots: [savedFormData.experience_picnic_spots || false],
      experience_kids_activities: [savedFormData.experience_kids_activities || false]
    });
  }
  
  loadReferenceData() {
    // Load water sources (100 series)
    this.referenceService.getOptionsByCategory('water_source').subscribe({
      next: (response) => this.waterSources = response.data.filter(opt => opt.is_active),
      error: (err) => console.error('Failed to load water sources:', err)
    });
    
    // Load irrigation systems (200 series)
    this.referenceService.getOptionsByCategory('irrigation').subscribe({
      next: (response) => this.irrigationSystems = response.data.filter(opt => opt.is_active),
      error: (err) => console.error('Failed to load irrigation systems:', err)
    });
    
    // Load pest management (300 series)
    this.referenceService.getOptionsByCategory('pest_management').subscribe({
      next: (response) => this.pestManagementMethods = response.data.filter(opt => opt.is_active),
      error: (err) => console.error('Failed to load pest management:', err)
    });
    
    // Load safety equipment (400 series)
    this.referenceService.getOptionsByCategory('safety_equipment').subscribe({
      next: (response) => this.safetyEquipment = response.data.filter(opt => opt.is_active),
      error: (err) => console.error('Failed to load safety equipment:', err)
    });
    
    // Load property states (600 series)
    this.referenceService.getOptionsByCategory('property_state').subscribe({
      next: (response) => this.propertyStates = response.data.filter(opt => opt.is_active),
      error: (err) => console.error('Failed to load property states:', err)
    });
    
    // Load facilities (700 series)
    this.referenceService.getOptionsByCategory('facilities').subscribe({
      next: (response) => {
        console.log('Facilities API response:', response);
        // Handle both response formats: { success, data } or direct array
        if (response && response.data) {
          this.facilities = Array.isArray(response.data) 
            ? response.data.filter(opt => opt.is_active !== false) 
            : [];
        } else if (Array.isArray(response)) {
          // Fallback: if response is directly an array
          this.facilities = response.filter(opt => opt.is_active !== false);
        } else {
          this.facilities = [];
        }
        console.log('Filtered facilities:', this.facilities.length, 'items');
      },
      error: (err) => {
        console.error('Failed to load facilities:', err);
        console.error('Error details:', err.status, err.message, err.error);
        this.facilities = [];
      }
    });
    
    // Load farm types (900 series)
    this.referenceService.getOptionsByCategory('farm_type').subscribe({
      next: (response) => this.farmTypes = response.data ? response.data.filter(opt => opt.is_active) : [],
      error: (err) => console.error('Failed to load farm types:', err)
    });
    
    // Load organic inputs (1000 series)
    this.referenceService.getOptionsByCategory('organic_input').subscribe({
      next: (response) => this.organicInputs = response.data ? response.data.filter(opt => opt.is_active) : [],
      error: (err) => console.error('Failed to load organic inputs:', err)
    });
    
    // Load experience types (1100 series)
    this.referenceService.getOptionsByCategory('experience_type').subscribe({
      next: (response) => this.experienceTypes = response.data ? response.data.filter(opt => opt.is_active) : [],
      error: (err) => console.error('Failed to load experience types:', err)
    });
    
    // Load image types (800 series)
    this.referenceService.getOptionsByCategory('image_type').subscribe({
      next: (response) => this.imageTypes = response.data ? response.data.filter(opt => opt.is_active) : [],
      error: (err) => console.error('Failed to load image types:', err)
    });
  }
  
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.propertyForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  // File upload methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  handleFileSelection(file: File) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    this.proofOfOwnershipFile = file;
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.proofOfOwnershipPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    // Upload file to server if property ID exists
    if (this.currentPropertyId) {
      this.uploadProofOfOwnership(file);
    } else {
      // Store file name temporarily, will upload when property is created
      this.propertyForm.patchValue({
        proof_of_ownership: file.name
      });
      this.saveProgress();
    }
  }

  uploadProofOfOwnership(file: File) {
    if (!this.currentPropertyId) {
      console.warn('Cannot upload: Property ID not available');
      return;
    }

    // Use property service to upload document
    this.propertyService.uploadMedia(this.currentPropertyId, [file], 'proof_of_ownership').subscribe({
      next: (response: any) => {
        if (response && response.length > 0 && response[0].url) {
          this.propertyForm.patchValue({
            proof_of_ownership: response[0].url
          });
          this.saveProgress();
          console.log('Proof of ownership uploaded successfully:', response[0].url);
        }
      },
      error: (err) => {
        console.error('Failed to upload proof of ownership:', err);
        alert('Failed to upload document. Please try again.');
        // Fallback: store file name
        this.propertyForm.patchValue({
          proof_of_ownership: file.name
        });
      }
    });
  }

  removeProofOfOwnership() {
    this.proofOfOwnershipFile = null;
    this.proofOfOwnershipPreview = null;
    this.propertyForm.patchValue({
      proof_of_ownership: ''
    });
    this.saveProgress();
  }

  getFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
  
  toggleWaterSource(code: number) {
    const index = this.selectedWaterSources.indexOf(code);
    if (index >= 0) {
      this.selectedWaterSources.splice(index, 1);
    } else {
      this.selectedWaterSources.push(code);
    }
    this.saveProgress(); // Auto-save on selection change
  }
  
  toggleIrrigationSystem(code: number) {
    const index = this.selectedIrrigationSystems.indexOf(code);
    if (index >= 0) {
      this.selectedIrrigationSystems.splice(index, 1);
    } else {
      this.selectedIrrigationSystems.push(code);
    }
    this.saveProgress(); // Auto-save on selection change
  }
  
  togglePestManagement(code: number) {
    const index = this.selectedPestManagement.indexOf(code);
    if (index >= 0) {
      this.selectedPestManagement.splice(index, 1);
    } else {
      this.selectedPestManagement.push(code);
    }
    this.saveProgress(); // Auto-save on selection change
  }
  
  toggleSafetyEquipment(code: number) {
    const index = this.selectedSafetyEquipment.indexOf(code);
    if (index >= 0) {
      this.selectedSafetyEquipment.splice(index, 1);
    } else {
      this.selectedSafetyEquipment.push(code);
    }
    this.saveProgress(); // Auto-save on selection change
  }
  
  isWaterSourceSelected(code: number): boolean {
    return this.selectedWaterSources.includes(code);
  }
  
  isIrrigationSystemSelected(code: number): boolean {
    return this.selectedIrrigationSystems.includes(code);
  }
  
  isPestManagementSelected(code: number): boolean {
    return this.selectedPestManagement.includes(code);
  }
  
  isSafetyEquipmentSelected(code: number): boolean {
    return this.selectedSafetyEquipment.includes(code);
  }
  
  toggleFacility(code: number) {
    const index = this.selectedFacilities.indexOf(code);
    if (index >= 0) {
      this.selectedFacilities.splice(index, 1);
    } else {
      this.selectedFacilities.push(code);
    }
    this.saveProgress(); // Auto-save on selection change
  }
  
  isFacilitySelected(code: number): boolean {
    return this.selectedFacilities.includes(code);
  }
  
  nextStep() {
    if (this.isCurrentStepValid()) {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this.saveProgress(); // Save progress after moving to next step
        // Update step completion status after moving forward
        setTimeout(() => {
          this.updateStepsAccessibility();
        }, 100);
      }
    } else {
      this.markCurrentStepTouched();
      alert('Please complete all required fields before proceeding.');
    }
  }
  
  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.saveProgress(); // Save progress when going back
      // Update step completion status after moving back
      setTimeout(() => {
        this.updateStepsAccessibility();
      }, 100);
    }
  }
  
  isCurrentStepValid(): boolean {
    switch(this.currentStep) {
      case 0: // Basic Info
        return !!(this.propertyForm.get('property_name')?.valid && 
               this.propertyForm.get('owner_name')?.valid &&
               this.propertyForm.get('contact_person')?.valid &&
               this.propertyForm.get('phone_number')?.valid &&
               this.propertyForm.get('email_id')?.valid &&
               this.propertyForm.get('address')?.valid);
      case 1: // Land Details
        return !!(this.propertyForm.get('total_land_area')?.valid &&
               this.propertyForm.get('land_area_unit')?.valid &&
               this.propertyForm.get('ownership_type')?.valid);
      case 2: // Business Details
        return true; // All optional
      case 3: // Facilities
        return true; // All optional
      case 4: // Staff & Team
        return true; // All optional
      case 5: // Additional Information
        return true; // All optional
      case 6: // Crops & Produce
        // Crops step is optional - allow proceeding even with no crops or incomplete crop data
        return true;
      case 7: // Stay Facilities
        return true; // All optional
      case 8: // Experiences & Activities
        return true; // All optional
      case 9: // Photos & Media
        // Photos are optional during onboarding, can be added later
        return true;
      case 10: // Water & Irrigation
        return true; // All optional
      case 11: // Review & Submit
        return true; // All optional
      default:
        return true; // Default to allowing progression for unknown steps
    }
  }
  
  markCurrentStepTouched() {
    switch(this.currentStep) {
      case 0:
        this.propertyForm.get('property_name')?.markAsTouched();
        this.propertyForm.get('owner_name')?.markAsTouched();
        this.propertyForm.get('contact_person')?.markAsTouched();
        this.propertyForm.get('phone_number')?.markAsTouched();
        this.propertyForm.get('email_id')?.markAsTouched();
        this.propertyForm.get('address')?.markAsTouched();
        break;
      case 1:
        this.propertyForm.get('total_land_area')?.markAsTouched();
        this.propertyForm.get('land_area_unit')?.markAsTouched();
        this.propertyForm.get('ownership_type')?.markAsTouched();
        break;
    }
  }
  
  submitOnboarding() {
    if (!this.isCurrentStepValid()) {
      alert('Please complete all required fields.');
      return;
    }
    
    if (this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    const formValue = this.propertyForm.value;
      // Map form values to backend API format (snake_case JSON tags)
    const propertyData: any = {
      property_name: formValue.property_name,
      owner_name: formValue.owner_name,
      contact_person: formValue.contact_person,
      phone_number: formValue.phone_number,
      whatsapp_number: formValue.whatsapp_number || '',
      email_id: formValue.email_id,
      address: formValue.address,
      latitude: formValue.latitude || null,
      longitude: formValue.longitude || null,
      total_land_area: formValue.total_land_area,
      land_area_unit: formValue.land_area_unit || 'acres',
      years_in_operation: formValue.years_in_operation || null,
      ownership_type: formValue.ownership_type || 'owned',
      proof_of_ownership: formValue.proof_of_ownership || '',
      gst_number: formValue.gst_number || '',
      pan_number: formValue.pan_number || '',
      aadhar_number: formValue.aadhar_number || '',
      short_description: formValue.short_description || '',
      long_description: formValue.long_description || '',
      water_availability_issues: formValue.water_availability_issues || '',
      labour_shortage: formValue.labour_shortage || false,
      pest_disease: formValue.pest_disease || '',
      additional_notes: formValue.additional_notes || '',
      unique_features: formValue.unique_features || '',
      concerns: formValue.concerns || '',
      previous_partnership: formValue.previous_partnership || '',
      farm_owner_suggestions: formValue.farm_owner_suggestions || '',
      farm_type_code: formValue.farm_type_code || null,
      full_time_staff_count: formValue.num_full_time_staff || formValue.full_time_staff_count || 0,
      part_time_staff_count: formValue.num_part_time_staff || formValue.part_time_staff_count || 0,
      hospitality_trained_staff: formValue.hospitality_trained_staff || false,
      english_speaking_guide: formValue.english_speaking_farm_guide || formValue.english_speaking_guide || false,
      cooking_staff_available: formValue.cooking_staff_available || false,
      // Map selected facilities (700 series) to boolean fields
      crop_rotation_system: this.selectedFacilities.includes(701) || false,
      is_soil_tested: this.selectedFacilities.includes(702) || false,
      farm_boundary: this.selectedFacilities.includes(703) || false,
      parking_space_available: this.selectedFacilities.includes(704) || false,
      shelter_shade_area: this.selectedFacilities.includes(705) || false,
      cold_storage: this.selectedFacilities.includes(706) || false,
      storage_room: this.selectedFacilities.includes(707) || false,
      kitchen_facility: this.selectedFacilities.includes(708) || false,
      toilet_available: this.selectedFacilities.includes(709) || false,
      toilet_drinking_water: this.selectedFacilities.includes(710) || false,
      electricity_connection: this.selectedFacilities.includes(711) || false,
      backup_power: this.selectedFacilities.includes(712) || false,
      waste_management_system: this.selectedFacilities.includes(713) || false
    };
    
    // Don't remove null/empty values - let backend handle defaults
    // Only remove undefined values
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] === undefined) {
        delete propertyData[key];
      }
    });
    
    console.log('PropertyOnboarding: Submitting property data:', JSON.stringify(propertyData, null, 2));
    
    // Check if user is authenticated
    const token = sessionStorage.getItem('eco_adventure_park_access_token');
    if (!token) {
      this.errorMessage = 'You must be logged in to create a property. Please login first.';
      this.isSubmitting = false;
      alert('You must be logged in to create a property. Please login first.');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Dispatch action to create property
    console.log('PropertyOnboarding: Submitting property data:', propertyData);
    console.log('PropertyOnboarding: Auth token exists:', !!token);
    this.store.dispatch(PropertyActions.createProperty({ propertyData }));
  }
  
  getStepTitle(): string {
    const titles = [
      "Basic Information",
      "Land Details",
      "Business Details",
      "Facilities & Amenities",
      "Water Sources & Irrigation",
      "Review & Submit"
    ];
    return titles[this.currentStep] || '';
  }
  
  getStepDescription(): string {
    const descriptions = [
      "Tell us about your property",
      "Share details about your land",
      "Add business registration details (optional)",
      "Select available facilities and amenities",
      "Add water sources and irrigation systems",
      "Review your information and submit"
    ];
    return descriptions[this.currentStep] || '';
  }
  
  initializeSteps() {
    this.stepsList = [
      { index: 0, title: "Basic Information", description: "Property name and address", completed: false, accessible: true },
      { index: 1, title: "Land Details", description: "Area and ownership", completed: false, accessible: false },
      { index: 2, title: "Business Details", description: "GST, PAN, Aadhar (optional)", completed: false, accessible: false },
      { index: 3, title: "Facilities & Amenities", description: "Available facilities", completed: false, accessible: false },
      { index: 4, title: "Staff & Team", description: "Staff details and capabilities", completed: false, accessible: false },
      { index: 5, title: "Additional Information", description: "Notes, constraints, and features", completed: false, accessible: false },
      { index: 6, title: "Crops & Produce", description: "Crop details and availability", completed: false, accessible: false },
      { index: 7, title: "Stay Facilities", description: "Rooms and accommodation", completed: false, accessible: false },
      { index: 8, title: "Experiences & Activities", description: "Activities offered", completed: false, accessible: false },
      { index: 9, title: "Photos & Media", description: "Property images", completed: false, accessible: false },
      { index: 10, title: "Water & Irrigation", description: "Water sources and systems", completed: false, accessible: false },
      { index: 11, title: "Review & Submit", description: "Review and finalize", completed: false, accessible: false }
    ];
  }
  
  updateStepsAccessibility() {
    // Step 0 is always accessible
    this.stepsList[0].accessible = true;
    this.stepsList[0].completed = this.isStepCompleted(0);
    
    // Check each step's completion status
    for (let i = 1; i < this.stepsList.length; i++) {
      // A step is accessible if the previous step is completed OR if current step is past it
      const prevStepCompleted = this.isStepCompleted(i - 1);
      this.stepsList[i].accessible = prevStepCompleted || this.currentStep >= i;
      this.stepsList[i].completed = this.isStepCompleted(i);
    }
  }
  
  isStepCompleted(stepIndex: number): boolean {
    // If current step is past this step, mark it as completed
    if (this.currentStep > stepIndex) {
      return true;
    }
    
    // If this is the current step, check if it's valid
    if (this.currentStep === stepIndex) {
      return this.isCurrentStepValid();
    }
    
    // For past steps, check if they have data
    const formValue = this.propertyForm.value;
    
    switch(stepIndex) {
      case 0: // Basic Info - must have name and address
        return !!(formValue.property_name?.trim() && formValue.address?.trim());
      case 1: // Land Details - must have area and ownership
        return !!(formValue.total_land_area && formValue.ownership_type);
      case 2: // Business Details - mark as completed if user has visited
        return this.currentStep > 2;
      case 3: // Facilities - mark as completed if user has visited
        return this.currentStep > 3;
      case 4: // Staff & Team - mark as completed if user has visited
        return this.currentStep > 4;
      case 5: // Additional Information - mark as completed if user has visited
        return this.currentStep > 5;
      case 6: // Crops - mark as completed if user has visited
        return this.currentStep > 6;
      case 7: // Stay Facilities - mark as completed if user has visited
        return this.currentStep > 7;
      case 8: // Experiences - mark as completed if user has visited
        return this.currentStep > 8;
      case 9: // Photos/Media - check if photos uploaded
        return this.uploadedImages.length >= 3 || this.currentStep > 9;
      case 10: // Water/Irrigation - mark as completed if user has visited
        return this.currentStep > 10;
      case 11: // Review - mark as completed if user has visited
        return this.currentStep > 11;
      default:
        return false;
    }
  }
  
  onStepSelected(stepIndex: number) {
    if (this.stepsList[stepIndex]?.accessible) {
      this.currentStep = stepIndex;
      this.saveProgress();
      this.updateStepsAccessibility();
    }
  }
  
  onClearProgress() {
    this.clearSavedProgressAndRestart();
    this.updateStepsAccessibility();
  }
  
  hasSavedProgress(): boolean {
    return !!localStorage.getItem('property_onboarding_draft');
  }
  
  clearSavedProgressAndRestart() {
    if (confirm('Are you sure you want to start fresh? This will clear all your saved progress.')) {
      this.clearSavedProgress();
      this.propertyForm.reset();
      this.selectedWaterSources = [];
      this.selectedIrrigationSystems = [];
      this.selectedPestManagement = [];
      this.selectedSafetyEquipment = [];
      this.selectedFacilities = [];
      this.currentStep = 0;
    }
  }

  // Photo upload methods
  onPhotoDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          this.handlePhotoSelection(files[i]);
        }
      }
    }
  }

  onPhotoSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.handlePhotoSelection(files[i]);
      }
    }
  }

  handlePhotoSelection(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload image files only (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please compress the image and try again.');
      return;
    }

    // Check if image with same name already exists
    if (this.uploadedImages.some(img => img.name === file.name)) {
      alert('This image has already been uploaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedImages.push({
        file: file,
        preview: e.target.result,
        name: file.name,
        typeCode: null
      });
      this.saveProgress();
      this.updateStepsAccessibility(); // Update step completion status
    };
    reader.readAsDataURL(file);
  }

  removePhoto(index: number) {
    this.uploadedImages.splice(index, 1);
    this.saveProgress();
    this.updateStepsAccessibility(); // Update step completion status
  }

  // Crop management
  addCrop() {
    this.crops.push({
      crop_name: '',
      area_under_cultivation: 0,
      expected_monthly_quantity: 0,
      seasonal_availability: '',
      current_selling_price: 0,
      minimum_quantity_to_commit: 0,
      packing_reference: '',
      ability_to_deliver: false,
      pickup_point: '',
      preferred_delivery_days: '',
      type_of_vehicle: '',
      packing_material: '',
      distance_from_ncr: 0,
      time_to_deliver: ''
    });
    this.saveProgress();
  }

  removeCrop(index: number) {
    this.crops.splice(index, 1);
    // Rebuild cropOrganicInputs to maintain correct indices
    const newCropOrganicInputs: { [key: number]: number[] } = {};
    this.crops.forEach((_, i) => {
      if (this.cropOrganicInputs[i] !== undefined) {
        newCropOrganicInputs[i] = this.cropOrganicInputs[i];
      } else {
        newCropOrganicInputs[i] = [];
      }
    });
    this.cropOrganicInputs = newCropOrganicInputs;
    this.saveProgress();
  }

  toggleOrganicInput(cropIndex: number, inputCode: number) {
    if (!this.cropOrganicInputs[cropIndex]) {
      this.cropOrganicInputs[cropIndex] = [];
    }
    const index = this.cropOrganicInputs[cropIndex].indexOf(inputCode);
    if (index >= 0) {
      this.cropOrganicInputs[cropIndex].splice(index, 1);
    } else {
      this.cropOrganicInputs[cropIndex].push(inputCode);
    }
    this.saveProgress();
  }

  isOrganicInputSelected(cropIndex: number, inputCode: number): boolean {
    return this.cropOrganicInputs[cropIndex]?.includes(inputCode) || false;
  }

  // Stay facility management
  addStayFacility() {
    this.stayFacilities.push({
      room_type: '',
      number_of_rooms: 1,
      bathrooms_attached: false,
      bathrooms_shared: false,
      hot_water: false,
      max_guest_capacity: 0,
      check_in_time: '',
      check_out_time: '',
      guest_safety: '',
      hygiene_cleaning_rating: 0,
      toilet_hygiene_rating: 0,
      pathway_safety: '',
      animal_safety_measures: '',
      emergency_plans: '',
      first_aid_kit: false,
      cctv: false,
      amenities: '',
      photos: []
    });
    this.saveProgress();
  }

  removeStayFacility(index: number) {
    this.stayFacilities.splice(index, 1);
    this.saveProgress();
  }

  // Save crops to backend
  saveCrops(propertyId: string) {
    this.crops.forEach((crop, index) => {
      // Map frontend crop data to backend format
      const cropData = {
        crop_name: crop.crop_name,
        area_under_cultivation: crop.area_under_cultivation || 0,
        expected_monthly_quantity: crop.expected_monthly_quantity || 0,
        seasonal_availability: crop.seasonal_availability || '',
        current_selling_price: crop.current_selling_price || 0,
        minimum_quantity_commitment: crop.minimum_quantity_to_commit || 0,
        packing_reference: crop.packing_reference || '',
        can_deliver: crop.ability_to_deliver || false,
        pickup_point: crop.pickup_point || '',
        preferred_delivery_days: crop.preferred_delivery_days || '',
        vehicle_type: crop.type_of_vehicle || '',
        packing_material: crop.packing_material || '',
        distance_from_ncr: crop.distance_from_ncr || 0,
        time_to_deliver_hours: crop.time_to_deliver ? parseFloat(crop.time_to_deliver.toString().replace(/[^0-9.]/g, '')) : 0
      };

      this.propertyService.addCrop(propertyId, cropData).subscribe({
        next: (response: any) => {
          const cropId = response.data?.id;
          if (cropId && this.cropOrganicInputs[index] && this.cropOrganicInputs[index].length > 0) {
            // Save organic inputs for this crop
            this.cropOrganicInputs[index].forEach(inputCode => {
              this.propertyService.addOrganicInput(propertyId, cropId, inputCode).subscribe({
                next: () => console.log(`Organic input ${inputCode} added to crop ${cropId}`),
                error: (err) => console.error(`Failed to add organic input:`, err)
              });
            });
          }
          console.log(`Crop ${index + 1} saved successfully`);
        },
        error: (err) => {
          console.error(`Failed to save crop ${index + 1}:`, err);
        }
      });
    });
  }

  // Save stay facilities to backend
  saveStayFacilities(propertyId: string) {
    // TODO: Implement stay facilities API when backend endpoint is ready
    console.log('Stay facilities to be saved:', this.stayFacilities);
  }

  uploadPropertyPhotos() {
    if (!this.currentPropertyId || this.uploadedImages.length === 0) {
      return;
    }

    // Upload each photo with its type
    this.uploadedImages.forEach((image, index) => {
      if (image.file) {
        // Use image type code if available, otherwise use a default type
        const imageType = image.typeCode ? `image_type_${image.typeCode}` : 'general';
        
        this.propertyService.uploadMedia(this.currentPropertyId!, [image.file], imageType).subscribe({
          next: (response: any) => {
            console.log(`Photo ${index + 1} uploaded successfully`);
            // Update the image with the uploaded URL if provided
            if (response && response.length > 0 && response[0].url) {
              image.uploadedUrl = response[0].url;
            }
          },
          error: (err) => {
            console.error(`Failed to upload photo ${index + 1}:`, err);
            alert(`Failed to upload photo ${index + 1}. Please try again.`);
          }
        });
      } else if (!image.typeCode) {
        console.warn(`Photo ${index + 1} missing image type. Please select an image type.`);
      }
    });
  }
  
  private checkLocalStorageForProperty() {
    // Check localStorage for saved property ID and verify it exists
    const savedPropertyId = localStorage.getItem('current_onboarding_property_id');
    if (savedPropertyId) {
      // Verify the property exists before using it
      this.propertyService.getProperty(savedPropertyId).subscribe({
        next: (response) => {
          if (response.data && response.data.id) {
            this.currentPropertyId = savedPropertyId;
            this.loadPropertyFromDB(savedPropertyId);
          } else {
            // Property doesn't exist, clear invalid ID
            console.warn('Saved property ID is invalid, clearing');
            localStorage.removeItem('current_onboarding_property_id');
            setTimeout(() => {
              this.loadSavedProgress();
              this.updateStepsAccessibility();
            }, 100);
          }
        },
        error: (err) => {
          // Property doesn't exist or error, clear invalid ID
          console.warn('Saved property ID is invalid (404), clearing:', err);
          localStorage.removeItem('current_onboarding_property_id');
          setTimeout(() => {
            this.loadSavedProgress();
            this.updateStepsAccessibility();
          }, 100);
        }
      });
    } else {
      setTimeout(() => {
        this.loadSavedProgress();
        this.updateStepsAccessibility();
      }, 100);
    }
  }
}

