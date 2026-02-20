import { Component, OnInit, OnDestroy, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, distinctUntilChanged, firstValueFrom, debounceTime, take } from 'rxjs';

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
  totalSteps = 13; // 0: Basic Info ... 10: Pricing, 11: Water, 12: Review
  currentPropertyId: string | null = null; // Track if we're editing an existing property
  isNewPropertyMode = false; // Flag to track if we're creating a fresh new property

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

  // Calendar State for Pricing Step
  calendarDays: (Date | null)[][] = [];
  currentDate = new Date();
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  selectedDates: Date[] = []; // Multi-select support
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  isSelectingDates = false;
  selectionMode: 'select' | 'deselect' = 'select';

  rateSettings = {
    price: 0,
    availableUnits: 1,
    status: 'available'
  };
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
  private isRestoringFromDb = false;
  private store = inject(Store);
  private propertyService = inject(PropertyService);
  private referenceService = inject(ReferenceService);

  private readonly backendBaseUrl = 'http://localhost:8080';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

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

    // Auto-save typed input (debounced) so textareas persist without needing Next/Previous.
    // Guarded to avoid firing during DB restore patchValue.
    this.propertyForm.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isRestoringFromDb) {
          return;
        }
        // Don't autosave experiences checkboxes on every click; save once when leaving the step.
        if (this.currentStep === 8) {
          return;
        }
        // Only PATCH when a property exists; otherwise we wait until draft property is created.
        // In 'new' mode, don't auto-create draft properties on typing - wait for explicit save
        if (this.currentPropertyId && !this.isNewPropertyMode) {
          this.saveProgress(false);
        }
      });

    this.loadReferenceData();
    this.initializeSteps();
    this.generateCalendar();

    // First, try to get the latest draft property from the backend
    // This ensures we always use the most recent draft, not just what's in localStorage
    // BUT only if no specific propertyId is provided in the URL and 'new' flag is not set
    const isNewProperty = urlParams.get('new') === 'true';

    if (!propertyId && !isNewProperty) {
      this.propertyService.getLatestDraftProperty().subscribe({
        next: (response) => {
          if (response.data && response.data.id) {
            // Found a draft property in the database
            console.log('Found draft property in database:', response.data.id);
            this.currentPropertyId = response.data.id;

            // Restore the onboarding step from the database
            if (response.data.onboarding_step !== undefined) {
              this.currentStep = response.data.onboarding_step;
            }

            queueMicrotask(() => this.cdr.detectChanges());

            // Load the full property data
            this.loadPropertyFromDB(this.currentPropertyId);
          } else {
            // No draft property found, start fresh
            this.clearSavedProgress();
            queueMicrotask(() => this.cdr.detectChanges());
          }
        },
        error: (err) => {
          // Error getting draft property, start fresh
          console.warn('Error getting draft property, starting fresh:', err);
          this.clearSavedProgress();
          queueMicrotask(() => this.cdr.detectChanges());
        }
      });
    } else if (propertyId) {
      // If propertyId is in URL, load that specific property
      this.loadPropertyFromDB(propertyId);
    } else {
      // Handle new property creation first - must be explicit
      if (isNewProperty) {
        // 'new=true' flag is set, start fresh without loading any draft
        this.isNewPropertyMode = true; // Set flag to prevent auto-save from binding to existing drafts
        console.log('Creating new property - skipping draft loading');
        // Reset submitting state to avoid picking up stale createdProperty
        this.isSubmitting = false;
        // Clear any stale property state from the store
        this.store.dispatch(PropertyActions.resetPropertySuccessStates());
        this.clearSavedProgress();
        queueMicrotask(() => this.cdr.detectChanges());
      }
    }

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
            // Once property is created, we're no longer in 'new' mode
            this.isNewPropertyMode = false;
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

  private resolveMediaUrl(url: any): any {
    if (!url || typeof url !== 'string') {
      return url;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      return `${this.backendBaseUrl}${url}`;
    }
    if (url.startsWith('uploads/')) {
      return `${this.backendBaseUrl}/${url}`;
    }
    return url;
  }

  private buildStepPayload(step: number): any {
    const formValue = this.propertyForm.value;
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

    switch (step) {
      case 0:
        return {
          property_name: formValue.property_name ?? '',
          owner_name: formValue.owner_name ?? '',
          contact_person: formValue.contact_person ?? '',
          phone_number: formValue.phone_number ?? '',
          whatsapp_number: formValue.whatsapp_number ?? '',
          email_id: formValue.email_id ?? '',
          address: formValue.address ?? '',
          latitude: formValue.latitude ?? null,
          longitude: formValue.longitude ?? null
        };
      case 1:
        return {
          total_land_area: formValue.total_land_area,
          land_area_unit: formValue.land_area_unit,
          years_in_operation: formValue.years_in_operation,
          ownership_type: formValue.ownership_type,
          proof_of_ownership: formValue.proof_of_ownership
        };
      case 2:
        return {
          gst_number: formValue.gst_number,
          pan_number: formValue.pan_number,
          aadhar_number: formValue.aadhar_number
        };
      case 3:
        return {
          ...facilityBooleans
        };
      case 4:
        return {
          full_time_staff_count: formValue.full_time_staff_count,
          part_time_staff_count: formValue.part_time_staff_count,
          hospitality_trained_staff: !!formValue.hospitality_trained_staff,
          english_speaking_guide: !!formValue.english_speaking_guide,
          cooking_staff_available: !!formValue.cooking_staff_available
        };
      case 5:
        return {
          short_description: formValue.short_description ?? '',
          long_description: formValue.long_description ?? '',
          water_availability_issues: formValue.water_availability_issues ?? '',
          labour_shortage: (formValue.labour_shortage === false || formValue.labour_shortage === true)
            ? ''
            : (formValue.labour_shortage ?? ''),
          pest_disease: formValue.pest_disease ?? '',
          constraints: (formValue.constraints === false || formValue.constraints === true)
            ? ''
            : (formValue.constraints ?? ''),
          limitations: (formValue.limitations === false || formValue.limitations === true)
            ? ''
            : (formValue.limitations ?? ''),
          additional_notes: formValue.additional_notes ?? '',
          unique_features: formValue.unique_features ?? '',
          concerns: formValue.concerns ?? '',
          previous_partnership: formValue.previous_partnership ?? '',
          farm_owner_suggestions: formValue.farm_owner_suggestions ?? ''
        };
      case 6:
      case 7:
      case 8:
      case 9:
      case 11:
      case 12:
        // These steps are handled by separate relational endpoints or are review-only.
        return {};
      case 10:
        return {
          price_per_day: formValue.price_per_day ?? null
        };
      default:
        // Steps handled by separate relational endpoints or local-only draft.
        return {};
    }
  }

  private sanitizePatchPayload(payload: any): any {
    if (!payload || typeof payload !== 'object') {
      return {};
    }
    const cleaned: any = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v === undefined || v === null) {
        continue;
      }
      cleaned[k] = v;
    }
    return cleaned;
  }

  async handlePropertyCreated(property: Property) {
    const propertyId = property.id;
    this.currentPropertyId = propertyId; // Track the property ID
    console.log('Property created successfully:', property);
    this.isSubmitting = false;

    // Save complete progress first (includes all form data, crops, facilities, experiences, images)
    this.saveProgress(false);

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

    try {
      if (this.crops.length > 0) {
        await this.saveCrops(propertyId);
      }

      if (this.stayFacilities.length > 0) {
        this.saveStayFacilities(propertyId);
      }

      if (this.uploadedImages.length > 0) {
        await this.ensurePendingPhotoUploads();
      }

      if (this.proofOfOwnershipFile) {
        this.uploadProofOfOwnership(this.proofOfOwnershipFile);
      }

      // alert('Property created successfully! All data has been saved.');
      // this.router.navigate(['/partner/dashboard']);
    } catch (e) {
      console.error('Error while persisting final onboarding data:', e);
      alert('Property submitted, but some crop/image data failed to save. Please reopen onboarding and retry.');
      this.router.navigate(['/partner/dashboard']);
    }

    // Clear saved progress on successful submission
    this.clearSavedProgress();

    // Reset success state to prevent re-triggering
    this.store.dispatch(PropertyActions.resetPropertySuccessStates());

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
    // Intentionally not loading onboarding state from localStorage.
    // The backend draft property is the source of truth.
    return;
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

  saveProgress(saveRelationalData: boolean = true) {
    console.log('saveProgress: Called with saveRelationalData=', saveRelationalData, 'currentPropertyId=', this.currentPropertyId, 'isNewPropertyMode=', this.isNewPropertyMode);

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
      ...formValue,
      ...facilityBooleans,
      onboarding_step: this.currentStep,
      // Local backup still keeps everything
      selectedWaterSources: this.selectedWaterSources,
      selectedIrrigationSystems: this.selectedIrrigationSystems,
      selectedPestManagement: this.selectedPestManagement,
      selectedSafetyEquipment: this.selectedSafetyEquipment,
      selectedFacilities: this.selectedFacilities,
      crops: this.crops,
      cropOrganicInputs: this.cropOrganicInputs,
      stayFacilities: this.stayFacilities,
    };

    // Do not persist onboarding draft in localStorage (avoid cross-property overwrites)

    // If we have a property ID, save to database
    if (this.currentPropertyId) {
      // Only send current step payload to avoid overwriting other steps with defaults
      const backendData = this.sanitizePatchPayload({
        ...this.buildStepPayload(this.currentStep),
        onboarding_step: this.currentStep,
      });

      // Persist relational data only when explicitly requested (e.g., Next/Previous).
      if (saveRelationalData) {
        if (this.currentStep === 6) {
          this.saveAdditionalData(6);
        }
        if (this.currentStep === 7) {
          this.saveAdditionalData(7);
        }
        if (this.currentStep === 8) {
          this.saveAdditionalData(8);
        }
      }

      this.propertyService.saveOnboardingProgress(
        this.currentPropertyId,
        this.currentStep,
        backendData
      ).subscribe({
        next: () => {
          console.log('Onboarding progress saved to database');
          // Note: We do NOT save additional data (crops, etc.) to relational tables here
          // to avoid duplicate inserts. These are saved only upon final submission.
        },
        error: (err) => {
          console.error('Failed to save onboarding progress:', err);
          // If property doesn't exist (404), clear the invalid ID and create a new one
          if (err.status === 404 || err.status === 400) {
            console.warn('Property not found, clearing invalid ID and creating new property');
            this.currentPropertyId = null;
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
      const propertyName = this.propertyForm.get('property_name')?.value;
      const address = this.propertyForm.get('address')?.value;
      console.log('saveProgress: No currentPropertyId, checking to create draft. propertyName=', propertyName, 'address=', address);
      if (propertyName && address) {
        console.log('saveProgress: Calling createDraftProperty()');
        // Only create draft if NOT in new property mode (unless user explicitly saves?)
        // Actually, for autosave, we might want to skip creation if in new mode until some step?
        // But user wants standard flow.
        this.createDraftProperty();
      } else {
        console.log('saveProgress: Not creating draft - missing property_name or address');
      }
    }

    this.updateStepsAccessibility();
  }

  // Save additional data (crops, stay facilities, experiences) separately
  saveAdditionalData(step: number) {
    if (!this.currentPropertyId) {
      return;
    }

    if (step === 6) {
      if (this.crops.length > 0) {
        this.saveCrops(this.currentPropertyId);
      }
    }

    if (step === 7) {
      if (this.stayFacilities.length > 0) {
        this.saveStayFacilities(this.currentPropertyId);
      }
    }

    if (step === 8) {
      this.saveExperiences(this.currentPropertyId);
    }
  }

  private async saveExperiences(propertyId: string): Promise<void> {
    const experienceDefs = [
      { control: 'experience_farm_walk', type: 'farm_walk', name: 'Farm Walk' },
      { control: 'experience_vegetable_harvesting', type: 'vegetable_harvesting', name: 'Vegetable Harvesting' },
      { control: 'experience_animal_interaction', type: 'animal_interaction', name: 'Animal Interaction' },
      { control: 'experience_organic_farming_workshop', type: 'organic_farming_workshop', name: 'Organic Farming Workshop' },
      { control: 'experience_composting_demo', type: 'composting_demo', name: 'Composting Demo' },
      { control: 'experience_pottery', type: 'pottery', name: 'Pottery' },
      { control: 'experience_nature_trail', type: 'nature_trail', name: 'Nature Trail' },
      { control: 'experience_rural_games', type: 'rural_games', name: 'Rural Games' },
      { control: 'experience_bonfire', type: 'bonfire', name: 'Bonfire' },
      { control: 'experience_outdoor_seating', type: 'outdoor_seating', name: 'Outdoor Seating' },
      { control: 'experience_picnic_spots', type: 'picnic_spots', name: 'Picnic Spots' },
      { control: 'experience_kids_activities', type: 'kids_activities', name: 'Kids Activities' },
    ];

    const payload: any[] = [];
    for (const def of experienceDefs) {
      const enabled = !!this.propertyForm.get(def.control)?.value;
      if (enabled) {
        payload.push({
          experience_type: def.type,
          name: def.name,
          is_active: true,
        });
      }
    }

    await firstValueFrom(this.propertyService.replaceExperiences(propertyId, payload));
  }

  createDraftProperty() {
    // Don't create if already creating
    if (this.isSubmitting) {
      console.log('createDraftProperty: Blocked - isSubmitting is true');
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
      force_new: this.isNewPropertyMode, // Force create new property when in new property mode
    };

    console.log('createDraftProperty: Attempting with data:', propertyData);
    console.log('createDraftProperty: Form values:', { property_name: formValue.property_name, address: formValue.address });

    // Only create if we have minimum required data
    if (!propertyData.property_name || !propertyData.address) {
      console.log('createDraftProperty: Blocked - missing property_name or address');
      return;
    }

    console.log('createDraftProperty: Dispatching createProperty action');
    this.isSubmitting = true;
    this.store.dispatch(PropertyActions.createProperty({ propertyData }));

    // Subscribe to property creation to get the ID - use take(1) to complete after first result
    this.store.select((state: any) => state.property)
      .pipe(
        takeUntil(this.destroy$),
        filter((state: any) => {
          console.log('createDraftProperty store subscription: createdProperty=', state.createdProperty, 'currentPropertyId=', this.currentPropertyId);
          return state.createdProperty && !this.currentPropertyId;
        }),
        take(1) // Complete after getting the first created property
      )
      .subscribe((propertyState: any) => {
        console.log('createDraftProperty: Property created successfully:', propertyState.createdProperty);
        if (propertyState.createdProperty) {
          this.currentPropertyId = propertyState.createdProperty.id;
          this.isSubmitting = false;
          // Exit new property mode once we have a property ID
          this.isNewPropertyMode = false;
          // Now save the complete progress
          this.saveProgress(false);
        }
      });
  }

  loadPropertyFromDB(propertyId: string) {
    this.propertyService.getProperty(propertyId, true).subscribe({
      next: (response) => {
        const property = response.data;
        const propertyAny: any = property as any;

        // Resume from the last saved onboarding step in DB
        if (property?.onboarding_step !== undefined && property?.onboarding_step !== null) {
          this.currentStep = property.onboarding_step;
        }

        // Patch form so previously saved values are visible when resuming
        // (Facility booleans are derived from selectedFacilities)
        this.isRestoringFromDb = true;
        this.propertyForm.patchValue({
          property_name: property?.property_name ?? '',
          owner_name: property?.owner_name ?? '',
          contact_person: property?.contact_person ?? '',
          phone_number: property?.phone_number ?? '',
          whatsapp_number: property?.whatsapp_number ?? '',
          email_id: property?.email_id ?? '',
          address: property?.address ?? '',
          latitude: property?.latitude ?? null,
          longitude: property?.longitude ?? null,
          total_land_area: property?.total_land_area ?? null,
          land_area_unit: property?.land_area_unit ?? 'acres',
          years_in_operation: property?.years_in_operation ?? null,
          ownership_type: property?.ownership_type ?? 'owned',
          proof_of_ownership: property?.proof_of_ownership ?? '',
          constraints: (typeof propertyAny?.constraints === 'string') ? propertyAny.constraints : '',
          limitations: (typeof propertyAny?.limitations === 'string') ? propertyAny.limitations : '',
          gst_number: property?.gst_number ?? '',
          pan_number: property?.pan_number ?? '',
          aadhar_number: property?.aadhar_number ?? '',
          full_time_staff_count: property?.full_time_staff_count ?? 0,
          part_time_staff_count: property?.part_time_staff_count ?? 0,
          hospitality_trained_staff: property?.hospitality_trained_staff ?? false,
          english_speaking_guide: property?.english_speaking_guide ?? false,
          cooking_staff_available: property?.cooking_staff_available ?? false,
          short_description: property?.short_description ?? '',
          long_description: property?.long_description ?? '',
          water_availability_issues: property?.water_availability_issues ?? '',
          labour_shortage: (typeof propertyAny?.labour_shortage === 'string') ? propertyAny.labour_shortage : '',
          pest_disease: property?.pest_disease ?? '',
          additional_notes: property?.additional_notes ?? '',
          unique_features: property?.unique_features ?? '',
          concerns: property?.concerns ?? '',
          previous_partnership: property?.previous_partnership ?? '',
          farm_owner_suggestions: property?.farm_owner_suggestions ?? '',
          price_per_day: propertyAny?.price_per_day ?? null,
        }, { emitEvent: false });

        const expControls: Record<string, string> = {
          farm_walk: 'experience_farm_walk',
          vegetable_harvesting: 'experience_vegetable_harvesting',
          animal_interaction: 'experience_animal_interaction',
          organic_farming_workshop: 'experience_organic_farming_workshop',
          composting_demo: 'experience_composting_demo',
          pottery: 'experience_pottery',
          nature_trail: 'experience_nature_trail',
          rural_games: 'experience_rural_games',
          bonfire: 'experience_bonfire',
          outdoor_seating: 'experience_outdoor_seating',
          picnic_spots: 'experience_picnic_spots',
          kids_activities: 'experience_kids_activities',
        };

        const expPatch: Record<string, boolean> = {};
        Object.values(expControls).forEach((controlName) => {
          expPatch[controlName] = false;
        });

        const exps = Array.isArray(propertyAny?.experiences) ? propertyAny.experiences : [];
        for (const exp of exps) {
          const expType = (exp?.experience_type || '').toString().trim();
          const controlName = expControls[expType];
          if (controlName) {
            expPatch[controlName] = true;
          }
        }
        this.propertyForm.patchValue(expPatch, { emitEvent: false });
        this.isRestoringFromDb = false;

        // Reset and rebuild facilities selection to avoid duplicates on multiple loads
        this.selectedFacilities = [];
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

        // Restore images from normalized table
        if (property.images && property.images.length > 0) {
          this.uploadedImages = property.images.map((img: any) => ({
            name: img.alt_text || 'Image',
            typeCode: img.image_type_code,
            uploadedUrl: this.resolveMediaUrl(img.image_url),
            uploadedId: img.id,
            preview: this.resolveMediaUrl(img.thumbnail_url || img.image_url),
            file: null,
            size: 0,
            isUploading: false,
            uploadError: null
          }));
        } else {
          this.uploadedImages = [];
        }

        // Restore water sources
        if (property.water_sources) {
          this.selectedWaterSources = property.water_sources.map(ws => ws.source_code);
        }

        // Restore irrigation systems
        if (property.irrigation_systems) {
          this.selectedIrrigationSystems = property.irrigation_systems.map(is => is.system_code);
        }

        // Restore pest management
        if (property.pest_management) {
          this.selectedPestManagement = property.pest_management.map(pm => pm.method_code);
        }

        // Restore safety equipment
        if (property.safety_equipment) {
          this.selectedSafetyEquipment = property.safety_equipment.map(se => se.equipment_code);
        }

        // Restore crops
        if (property.crops && property.crops.length > 0) {
          this.crops = property.crops.map((crop: any) => ({
            crop_name: crop.crop_name,
            area_under_cultivation: crop.area_under_cultivation || 0,
            expected_monthly_quantity: crop.expected_monthly_quantity || 0,
            seasonal_availability: crop.seasonal_availability || '',
            current_selling_price: crop.current_selling_price || 0,
            minimum_quantity_to_commit: crop.minimum_quantity_commitment || 0,
            packing_reference: crop.packing_reference || '',
            ability_to_deliver: crop.can_deliver || false,
            pickup_point: crop.pickup_point || '',
            preferred_delivery_days: crop.preferred_delivery_days || '',
            type_of_vehicle: crop.vehicle_type || '',
            packing_material: crop.packing_material || '',
            distance_from_ncr: crop.distance_from_ncr || 0,
            time_to_deliver: crop.time_to_deliver_hours || 0
          }));

          // Restore organic inputs for each crop
          property.crops.forEach((crop: any, index: number) => {
            if (crop.organic_inputs) {
              this.cropOrganicInputs[index] = crop.organic_inputs.map((oi: any) => oi.input_code);
            } else {
              this.cropOrganicInputs[index] = [];
            }
          });
        }

        // Restore stay facilities
        if (property.stay_facilities && property.stay_facilities.length > 0) {
          this.stayFacilities = property.stay_facilities.map((sf: any) => ({
            room_type: sf.room_type,
            number_of_rooms: sf.number_of_rooms,
            bathrooms_attached: sf.bathrooms_attached > 0,
            bathrooms_shared: sf.bathrooms_shared > 0,
            hot_water: sf.hot_water_available,
            max_guest_capacity: sf.max_guest_capacity || 0,
            check_in_time: sf.check_in_time || '',
            check_out_time: sf.check_out_time || '',
            guest_safety: sf.guest_safety_rating || 0,
            hygiene_cleaning_rating: sf.hygiene_cleaning_rating || 0,
            toilet_hygiene_rating: sf.toilet_hygiene_rating || 0,
            pathway_safety: sf.pathway_safety_rating || 0,
            animal_safety_measures: sf.animal_safety_measures || '',
            emergency_plans: sf.emergency_plans || '',
            first_aid_kit: sf.first_aid_kit_available,
            cctv: sf.cctv_available,
            amenities: Array.isArray(sf.amenities) ? sf.amenities.join(', ') : sf.amenities || '',
            photos: sf.photos || []
          }));
        }

        this.updateStepsAccessibility();
      },
      error: (err: any) => {
        console.error('Failed to load property:', err);
        // If property not found, clear the invalid ID
        if (err.status === 404) {
          console.warn('Property not found (404), clearing invalid ID');
          this.currentPropertyId = null;
          this.clearSavedProgress();
        }
      }
    });
  }

  clearSavedProgress() {
    // Reset all form and state data when starting fresh
    this.currentPropertyId = null;
    this.currentStep = 0;
    this.crops = [];
    this.cropOrganicInputs = {};
    this.stayFacilities = [];
    this.experiences = [];
    this.uploadedImages = [];
    this.selectedWaterSources = [];
    this.selectedIrrigationSystems = [];
    this.selectedPestManagement = [];
    this.selectedSafetyEquipment = [];
    this.selectedFacilities = [];
    this.selectedOrganicInputs = [];
    this.proofOfOwnershipFile = null;
    this.proofOfOwnershipPreview = null;

    // Reset form to empty values
    if (this.propertyForm) {
      this.propertyForm.reset({
        property_name: '',
        owner_name: '',
        contact_person: '',
        phone_number: '',
        whatsapp_number: '',
        email_id: '',
        address: '',
        latitude: null,
        longitude: null,
        total_land_area: null,
        land_area_unit: 'acres',
        years_in_operation: null,
        ownership_type: 'owned',
        proof_of_ownership: '',
        gst_number: '',
        pan_number: '',
        aadhar_number: '',
        full_time_staff_count: 0,
        part_time_staff_count: 0,
        hospitality_trained_staff: false,
        english_speaking_guide: false,
        cooking_staff_available: false,
        short_description: '',
        long_description: '',
        water_availability_issues: '',
        labour_shortage: '',
        pest_disease: '',
        constraints: '',
        limitations: '',
        additional_notes: '',
        unique_features: '',
        concerns: '',
        previous_partnership: '',
        farm_owner_suggestions: '',
        price_per_day: null
      });
    }

    console.log('Cleared all progress - starting fresh property creation');
  }

  initializeForm() {
    // Do not load form state from localStorage.
    const savedFormData: any = {};

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

      // Step 4: Staff & Team Details
      full_time_staff_count: [savedFormData.full_time_staff_count || savedFormData.num_full_time_staff || 0, [Validators.min(0)]],
      part_time_staff_count: [savedFormData.part_time_staff_count || savedFormData.num_part_time_staff || 0, [Validators.min(0)]],
      hospitality_trained_staff: [savedFormData.hospitality_trained_staff || false],
      english_speaking_guide: [savedFormData.english_speaking_guide || savedFormData.english_speaking_farm_guide || false],
      cooking_staff_available: [savedFormData.cooking_staff_available || false],

      // Step 5: Additional Information
      short_description: [savedFormData.short_description || ''],
      long_description: [savedFormData.long_description || ''],
      water_availability_issues: [savedFormData.water_availability_issues || ''],
      labour_shortage: [savedFormData.labour_shortage || ''],
      pest_disease: [savedFormData.pest_disease || ''],
      constraints: [savedFormData.constraints || ''],
      limitations: [savedFormData.limitations || ''],
      additional_notes: [savedFormData.additional_notes || ''],
      unique_features: [savedFormData.unique_features || ''],
      concerns: [savedFormData.concerns || ''],
      previous_partnership: [savedFormData.previous_partnership || ''],
      farm_owner_suggestions: [savedFormData.farm_owner_suggestions || ''],

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
      experience_kids_activities: [savedFormData.experience_kids_activities || false],
      price_per_day: [savedFormData.price_per_day || null, [Validators.required, Validators.min(1)]],
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
      this.saveProgress(false);
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
        if (response && response.length > 0 && (response[0].image_url || response[0].ImageURL || response[0].url)) {
          this.propertyForm.patchValue({
            proof_of_ownership: this.resolveMediaUrl(response[0].image_url || response[0].ImageURL || response[0].url)
          });
          this.saveProgress(false);
          console.log('Proof of ownership uploaded successfully');
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
    this.saveProgress(false);
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
    this.saveProgress(false); // Auto-save on selection change
  }

  toggleIrrigationSystem(code: number) {
    const index = this.selectedIrrigationSystems.indexOf(code);
    if (index >= 0) {
      this.selectedIrrigationSystems.splice(index, 1);
    } else {
      this.selectedIrrigationSystems.push(code);
    }
    this.saveProgress(false); // Auto-save on selection change
  }

  togglePestManagement(code: number) {
    const index = this.selectedPestManagement.indexOf(code);
    if (index >= 0) {
      this.selectedPestManagement.splice(index, 1);
    } else {
      this.selectedPestManagement.push(code);
    }
    this.saveProgress(false); // Auto-save on selection change
  }

  toggleSafetyEquipment(code: number) {
    const index = this.selectedSafetyEquipment.indexOf(code);
    if (index >= 0) {
      this.selectedSafetyEquipment.splice(index, 1);
    } else {
      this.selectedSafetyEquipment.push(code);
    }
    this.saveProgress(false); // Auto-save on selection change
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
    this.saveProgress(false); // Auto-save on selection change
  }

  isFacilitySelected(code: number): boolean {
    return this.selectedFacilities.includes(code);
  }

  async nextStep() {
    if (this.isCurrentStepValid()) {
      if (this.currentStep < this.totalSteps - 1) {
        // Step 9 uploads are stored in normalized table; ensure uploads happen before moving on
        if (this.currentStep === 9 && this.currentPropertyId) {
          await this.ensurePendingPhotoUploads();
        }

        // Save the step we are leaving (important for step-specific payloads)
        this.saveProgress(true);
        this.currentStep++;
        // Update step completion status after moving forward
        setTimeout(() => {
          this.updateStepsAccessibility();
        }, 0);
      }
    } else {
      this.markCurrentStepTouched();
      alert('Please complete all required fields before proceeding.');
    }
  }

  async prevStep() {
    if (this.currentStep > 0) {
      // Step 9 uploads are stored in normalized table; ensure uploads happen before moving on
      if (this.currentStep === 9 && this.currentPropertyId) {
        await this.ensurePendingPhotoUploads();
      }

      // Save the step we are leaving
      this.saveProgress(true);
      this.currentStep--;
      // Update step completion status after moving back
      setTimeout(() => {
        this.updateStepsAccessibility();
      }, 0);
    }
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
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
        // Require minimum 3 photos with image types selected
        if (this.uploadedImages.length < 3) {
          return false;
        }
        // All photos must have image type selected
        return this.uploadedImages.every(img => img.typeCode !== null && img.typeCode !== undefined);
      case 10: // Pricing (New Step)
        return !!this.propertyForm.get('price_per_day')?.valid;
      case 11: // Water & Irrigation
        return true; // All optional
      case 12: // Review & Submit
        return true; // All optional
      default:
        return true; // Default to allowing progression for unknown steps
    }
  }

  markCurrentStepTouched() {
    switch (this.currentStep) {
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
      case 9:
        // Photos validation is handled in isCurrentStepValid
        break;
    }
  }

  buildPerStepPayload(stepIndex: number): any {
    const formValue = this.propertyForm.value;
    switch (stepIndex) {
      case 0: // Basic Info
        return {
          property_name: formValue.property_name,
          owner_name: formValue.owner_name,
          contact_person: formValue.contact_person,
          phone_number: formValue.phone_number,
          whatsapp_number: formValue.whatsapp_number || '',
          email_id: formValue.email_id,
          address: formValue.address,
          latitude: formValue.latitude || null,
          longitude: formValue.longitude || null
        };
      case 1: // Land Details
        return {
          total_land_area: formValue.total_land_area,
          land_area_unit: formValue.land_area_unit || 'acres',
          ownership_type: formValue.ownership_type || 'owned'
        };
      case 2: // Business Details
        return {
          gst_number: formValue.gst_number || '',
          pan_number: formValue.pan_number || '',
          aadhar_number: formValue.aadhar_number || ''
        };
      case 3: // Facilities
        return {
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
      case 4: // Staff & Team
        return {
          full_time_staff_count: formValue.full_time_staff_count || 0,
          part_time_staff_count: formValue.part_time_staff_count || 0,
          hospitality_trained_staff: formValue.hospitality_trained_staff || false,
          english_speaking_guide: formValue.english_speaking_guide || false,
          cooking_staff_available: formValue.cooking_staff_available || false
        };
      case 5: // Additional Information
        return {
          short_description: formValue.short_description || '',
          long_description: formValue.long_description || '',
          water_availability_issues: formValue.water_availability_issues || '',
          labour_shortage: formValue.labour_shortage || '',
          pest_disease: formValue.pest_disease || '',
          additional_notes: formValue.additional_notes || '',
          unique_features: formValue.unique_features || '',
          concerns: formValue.concerns || '',
          previous_partnership: formValue.previous_partnership || '',
          farm_owner_suggestions: formValue.farm_owner_suggestions || ''
        };
      case 6: // Crops & Produce
        return {
          // Add crop data here
        };
      case 7: // Stay Facilities
        return {
          // Add stay facilities data here
        };
      case 8: // Experiences & Activities
        return {
          // Add experiences & activities data here
        };
      case 9: // Photos & Media
        return {
          // Add photos & media data here
        };
      case 10: // Pricing
        return {
          price_per_day: formValue.price_per_day
        };
      case 11: // Water & Irrigation
        return {
          // Add water & irrigation data here
        };
      case 12: // Review & Submit
        return {
          state: 602
        };
      default:
        return {};
    }
  }

  submitOnboarding() {
    // Validate photos step specifically
    if (this.currentStep === 9) {
      if (this.uploadedImages.length < 3) {
        alert('Please upload at least 3 photos before submitting.');
        return;
      }
      const photosWithoutType = this.uploadedImages.filter(img => !img.typeCode);
      if (photosWithoutType.length > 0) {
        alert(`Please select image type for all ${photosWithoutType.length} photo(s).`);
        return;
      }
      // Check if any photos are still uploading
      const uploadingPhotos = this.uploadedImages.filter(img => img.isUploading);
      if (uploadingPhotos.length > 0) {
        alert('Please wait for all photos to finish uploading before submitting.');
        return;
      }
      // Try to upload any photos that haven't been uploaded yet
      this.uploadPropertyPhotos();
    }

    if (!this.isCurrentStepValid()) {
      alert('Please complete all required fields.');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const photosNotUploaded = this.uploadedImages.filter(img => !img.uploadedUrl);
    if (photosNotUploaded.length > 0) {
      alert('Please wait for all photos to upload successfully before submitting.');
      return;
    }

    const photosWithUploadError = this.uploadedImages.filter(img => img.uploadError);
    if (photosWithUploadError.length > 0) {
      alert('Some photos failed to upload. Please retry failed uploads before submitting.');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.propertyForm.value;
    // Full payload only on final submission
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
      labour_shortage: formValue.labour_shortage || '',
      pest_disease: formValue.pest_disease || '',
      additional_notes: formValue.additional_notes || '',
      unique_features: formValue.unique_features || '',
      concerns: formValue.concerns || '',
      previous_partnership: formValue.previous_partnership || '',
      farm_owner_suggestions: formValue.farm_owner_suggestions || '',
      farm_type_code: formValue.farm_type_code || null,
      full_time_staff_count: formValue.full_time_staff_count || 0,
      part_time_staff_count: formValue.part_time_staff_count || 0,
      hospitality_trained_staff: formValue.hospitality_trained_staff || false,
      english_speaking_guide: formValue.english_speaking_guide || false,
      cooking_staff_available: formValue.cooking_staff_available || false,
      ...{
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
      },
      state: 602
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

    // Dispatch action to update or create property
    console.log('PropertyOnboarding: Submitting property data:', propertyData);
    console.log('PropertyOnboarding: Auth token exists:', !!token);

    if (this.currentPropertyId) {
      const updates = { ...propertyData, id: this.currentPropertyId };
      this.store.dispatch(PropertyActions.updateProperty({ propertyId: this.currentPropertyId, updates }));
    } else {
      this.store.dispatch(PropertyActions.createProperty({ propertyData }));
    }
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
      { index: 10, title: "Pricing", description: "Set your rates", completed: false, accessible: false },
      { index: 11, title: "Water & Irrigation", description: "Water sources and systems", completed: false, accessible: false },
      { index: 12, title: "Review & Submit", description: "Review and finalize", completed: false, accessible: false }
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

    switch (stepIndex) {
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
      case 9: // Photos/Media - check if photos uploaded with types
        return this.uploadedImages.length >= 3 &&
          this.uploadedImages.every(img => img.typeCode !== null && img.typeCode !== undefined) ||
          this.currentStep > 9;
      case 10: // Pricing
        return this.propertyForm.get('price_per_day')?.valid || false;
      case 11: // Water/Irrigation
        return this.currentStep > 11;
      case 12: // Review
        return this.currentStep > 12;
      default:
        return false;
    }
  }

  onStepSelected(stepIndex: number) {
    if (this.stepsList[stepIndex]?.accessible) {
      this.saveProgress(false);
      this.currentStep = stepIndex;
      this.updateStepsAccessibility();
    }
  }

  onClearProgress() {
    this.clearSavedProgressAndRestart();
    this.updateStepsAccessibility();
  }

  hasSavedProgress(): boolean {
    return false;
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
    if (this.uploadedImages.some(img => img.name === file.name && img.size === file.size)) {
      alert('This image has already been uploaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageData = {
        file: file,
        preview: e.target.result,
        name: file.name,
        size: file.size,
        typeCode: null,
        uploadedUrl: null,
        isUploading: false,
        uploadError: null
      };
      this.uploadedImages.push(imageData);
      this.saveProgress(false);
      this.updateStepsAccessibility(); // Update step completion status
    };
    reader.readAsDataURL(file);
  }

  removePhoto(index: number) {
    this.uploadedImages.splice(index, 1);
    this.saveProgress(false);
    this.updateStepsAccessibility(); // Update step completion status
  }

  hasPhotosWithoutType(): boolean {
    return this.uploadedImages.some(img => !img.typeCode);
  }

  allPhotosHaveType(): boolean {
    return this.uploadedImages.length >= 3 &&
      this.uploadedImages.every(img => img.typeCode !== null && img.typeCode !== undefined);
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
    this.saveProgress(false);
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
    this.saveProgress(false);
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
    this.saveProgress(false);
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
    this.saveProgress(false);
  }

  removeStayFacility(index: number) {
    this.stayFacilities.splice(index, 1);
    this.saveProgress(false);
  }

  // Price setting
  setPrice(price: number) {
    this.propertyForm.patchValue({
      price_per_day: price
    });
    this.saveProgress(false);
  }

  // Calendar Methods
  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let date = 1;
    let days: (Date | null)[] = [];
    const weeks: (Date | null)[][] = [];

    // Fill empty slots
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    while (date <= daysInMonth) {
      days.push(new Date(this.currentYear, this.currentMonth, date));
      if (days.length === 7) {
        weeks.push(days);
        days = [];
      }
      date++;
    }

    if (days.length > 0) {
      while (days.length < 7) {
        days.push(null);
      }
      weeks.push(days);
    }

    this.calendarDays = weeks;
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  getBookingMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  toggleCalendarDate(date: Date | null) {
    if (!date) return;

    const existingIndex = this.selectedDates.findIndex(d => d.getTime() === date.getTime());
    if (existingIndex >= 0) {
      this.selectedDates.splice(existingIndex, 1);
    } else {
      this.selectedDates.push(date);
    }
  }

  isSelectedDate(date: Date | null): boolean {
    if (!date) return false;
    return this.selectedDates.some(d => d.getTime() === date.getTime());
  }

  onMouseDown(date: Date | null) {
    if (!date) return;
    this.isSelectingDates = true;
    const isAlreadySelected = this.isSelectedDate(date);
    this.selectionMode = isAlreadySelected ? 'deselect' : 'select';
    this.handleSelection(date);
  }

  onMouseEnter(date: Date | null) {
    if (!this.isSelectingDates || !date) return;
    this.handleSelection(date);
  }

  onMouseUp() {
    this.isSelectingDates = false;
  }

  handleSelection(date: Date | null) {
    if (!date) return;
    const dateExists = this.isSelectedDate(date);

    if (this.selectionMode === 'select' && !dateExists) {
      this.selectedDates.push(date);
    } else if (this.selectionMode === 'deselect' && dateExists) {
      const index = this.selectedDates.findIndex(d => d.getTime() === date.getTime());
      if (index >= 0) {
        this.selectedDates.splice(index, 1);
      }
    }
  }

  saveDailyRates() {
    if (!this.currentPropertyId) {
      alert("Property ID not found. Please complete previous steps first.");
      return;
    }
    if (this.selectedDates.length === 0) {
      alert("Please select dates to apply rates.");
      return;
    }

    // If price is 0, use default
    let priceToSave = this.rateSettings.price > 0 ? this.rateSettings.price : this.propertyForm.get('price_per_day')?.value;

    // Sync back to form if form price is empty but settings has a price
    if (this.rateSettings.price > 0 && !this.propertyForm.get('price_per_day')?.value) {
      this.propertyForm.patchValue({ price_per_day: this.rateSettings.price });
      priceToSave = this.rateSettings.price;
    }

    if (!priceToSave) {
      alert("Please enter a valid price.");
      return;
    }

    const ratesPayload = this.selectedDates.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      return {
        date: dateStr,
        price: priceToSave,
        status: this.rateSettings.status,
        available_units: this.rateSettings.availableUnits,
        currency: 'INR'
      };
    });

    this.propertyService.saveDailyRatesBulk({
      property_id: this.currentPropertyId,
      rates: ratesPayload
    }).subscribe({
      next: () => {
        alert(`Rates saved for ${this.selectedDates.length} dates.`);
        this.selectedDates = [];
      },
      error: (err) => {
        console.error('Failed to save daily rates', err);
        alert('Failed to save rates. Please try again.');
      }
    });
  }

  onPriceSettingsChange() {
    if (this.rateSettings.price > 0 && !this.propertyForm.get('price_per_day')?.value) {
      this.propertyForm.patchValue({ price_per_day: this.rateSettings.price });
    }
  }

  // Save crops to backend
  async saveCrops(propertyId: string): Promise<void> {
    const payload: any[] = [];
    for (let index = 0; index < this.crops.length; index++) {
      const crop = this.crops[index];
      const cropName = (crop.crop_name || '').trim();
      if (!cropName) {
        continue;
      }

      payload.push({
        crop_name: cropName,
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
        time_to_deliver_hours: crop.time_to_deliver ? parseFloat(crop.time_to_deliver.toString().replace(/[^0-9.]/g, '')) : 0,
        organic_inputs: this.cropOrganicInputs[index] || [],
      });
    }

    await firstValueFrom(this.propertyService.replaceCrops(propertyId, payload));
  }

  // Save stay facilities to backend
  async saveStayFacilities(propertyId: string): Promise<void> {
    const payload: any[] = [];

    for (const facility of this.stayFacilities) {
      const roomType = (facility?.room_type || '').trim();
      if (!roomType) {
        continue;
      }

      const amenitiesArray = typeof facility?.amenities === 'string'
        ? facility.amenities
          .split(/[\n,]/)
          .map((s: string) => s.trim())
          .filter(Boolean)
        : [];

      payload.push({
        room_type: roomType,
        number_of_rooms: Number(facility?.number_of_rooms || 1),
        bathrooms_attached: facility?.bathrooms_attached ? 1 : 0,
        bathrooms_shared: facility?.bathrooms_shared ? 1 : 0,
        hot_water_available: !!facility?.hot_water,
        max_guest_capacity: facility?.max_guest_capacity ? Number(facility.max_guest_capacity) : null,
        check_in_time: facility?.check_in_time || null,
        check_out_time: facility?.check_out_time || null,
        guest_safety_rating: facility?.guest_safety ? Number(facility.guest_safety) : null,
        hygiene_cleaning_rating: facility?.hygiene_cleaning_rating ? Number(facility.hygiene_cleaning_rating) : null,
        toilet_hygiene_rating: facility?.toilet_hygiene_rating ? Number(facility.toilet_hygiene_rating) : null,
        pathway_safety_rating: facility?.pathway_safety ? Number(facility.pathway_safety) : null,
        animal_safety_measures: facility?.animal_safety_measures || '',
        emergency_plans: facility?.emergency_plans || '',
        first_aid_kit_available: !!facility?.first_aid_kit,
        cctv_available: !!facility?.cctv,
        amenities: amenitiesArray,
        photos: Array.isArray(facility?.photos) ? facility.photos : [],
        is_active: true,
      });
    }

    await firstValueFrom(this.propertyService.replaceStayFacilities(propertyId, payload));
  }

  // Upload a single photo
  uploadSinglePhoto(image: any, index: number) {
    if (!this.currentPropertyId || !image.file) {
      return;
    }

    // Don't upload while already uploading
    if (image.isUploading) {
      return;
    }

    image.isUploading = true;
    image.uploadError = null;

    // Use image type code if available, otherwise use a default type
    // Backend expects just the code number, not "image_type_801"
    const imageType = image.typeCode ? image.typeCode.toString() : 'general';

    this.propertyService.uploadMedia(this.currentPropertyId!, [image.file], imageType).subscribe({
      next: (response: any) => {
        image.isUploading = false;
        console.log(`Photo ${index + 1} uploaded successfully`, response);

        // Backend returns array of PropertyImage objects with image_url field (snake_case)
        if (response && Array.isArray(response) && response.length > 0) {
          const uploadedImage = response[0];
          image.uploadedUrl = this.resolveMediaUrl(uploadedImage.image_url || uploadedImage.ImageURL || uploadedImage.url);
          image.uploadedId = uploadedImage.id || uploadedImage.ID;
          console.log('Photo uploaded successfully:', image.uploadedUrl);
          this.saveProgress(false);
        } else if (response && (response.image_url || response.ImageURL || response.url)) {
          // Handle single object response
          image.uploadedUrl = this.resolveMediaUrl(response.image_url || response.ImageURL || response.url);
          image.uploadedId = response.id || response.ID;
          console.log('Photo uploaded successfully:', image.uploadedUrl);
          this.saveProgress(false);
        } else {
          console.warn('Unexpected response format:', response);
        }
      },
      error: (err) => {
        image.isUploading = false;
        image.uploadError = err.message || 'Upload failed';
        console.error(`Failed to upload photo ${index + 1}:`, err);
        // Don't show alert for each failed upload, just log it
        // User can retry by changing image type or re-uploading
      }
    });
  }

  // Upload all photos that haven't been uploaded yet
  uploadPropertyPhotos() {
    if (!this.currentPropertyId || this.uploadedImages.length === 0) {
      return;
    }

    // Upload photos that have a file but haven't been uploaded yet
    this.uploadedImages.forEach((image, index) => {
      if (image.file && !image.uploadedUrl && !image.isUploading) {
        // Only upload if image type is selected
        if (image.typeCode) {
          this.uploadSinglePhoto(image, index);
        } else {
          console.warn(`Photo ${index + 1} missing image type. Please select an image type before uploading.`);
        }
      }
    });
  }

  // Upload photos when image type is selected
  onImageTypeSelected(image: any, index: number) {
    this.saveProgress(false);

    if (this.currentPropertyId && image.uploadedId && image.typeCode) {
      this.propertyService.updateMediaType(this.currentPropertyId, image.uploadedId, Number(image.typeCode)).subscribe({
        next: () => { },
        error: (err) => console.error('Failed to update media type', err)
      });
    }

    // Upload only after type is selected so image_type_code is persisted.
    if (this.currentPropertyId && image.file && image.typeCode && !image.uploadedUrl) {
      this.uploadSinglePhoto(image, index);
    }
  }

  private async ensurePendingPhotoUploads(): Promise<void> {
    const pendingPhotos = this.uploadedImages.filter(img => img.file && img.typeCode && !img.uploadedUrl && !img.isUploading);
    if (pendingPhotos.length === 0 || !this.currentPropertyId) {
      return;
    }

    await Promise.all(
      pendingPhotos.map((image, index) =>
        firstValueFrom(this.propertyService.uploadMedia(this.currentPropertyId!, [image.file], image.typeCode.toString()))
          .then((response: any) => {
            const uploadedImage = Array.isArray(response) ? response[0] : response;
            image.uploadedUrl = this.resolveMediaUrl(uploadedImage?.image_url || uploadedImage?.ImageURL || uploadedImage?.url);
            image.uploadedId = uploadedImage?.id || uploadedImage?.ID;
            image.uploadError = null;
          })
          .catch((err) => {
            console.error(`Failed to upload pending photo ${index + 1}:`, err);
            image.uploadError = err?.message || 'Upload failed';
            throw err;
          })
      )
    );
  }

  private checkLocalStorageForProperty(): void {
    // Intentionally no-op: localStorage should not control onboarding state.
    setTimeout(() => {
      this.clearSavedProgress();
      this.updateStepsAccessibility();
    }, 100);
  }

}
