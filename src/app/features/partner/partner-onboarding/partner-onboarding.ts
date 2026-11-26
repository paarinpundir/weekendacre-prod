import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SoilType } from '../../../core/models/farm.model';

@Component({
  selector: 'app-partner-onboarding',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './partner-onboarding.html',
  styleUrl: './partner-onboarding.scss',
  encapsulation: ViewEncapsulation.None
})
export class PartnerOnboarding implements OnInit {
  currentStep = 0; // Start with step 0 (host type selection)
  totalSteps = 7; // 0: Host Type, 1: Place Type, 2: Location, 3: Basics, 4: Amenities, 5: Photos, 6: Title/Description, 7: Review
  
  farmForm!: FormGroup;
  uploadedPhotos: { file: File, preview: string, category: string | null }[] = [];
  
  // Step 0: Host Type Selection
  selectedHostType: 'farm' | null = null;
  
  // Step 1: Place Type
  placeTypes = [
    { id: 'farm', label: 'Farm', icon: 'fa-solid fa-wheat-awn', description: 'A working farm with crops, livestock, or agricultural activities' },
    { id: 'farmhouse', label: 'Farmhouse', icon: 'fa-solid fa-house-chimney', description: 'A residential property on a farm with accommodation' },
    { id: 'eco_retreat', label: 'Eco Retreat', icon: 'fa-solid fa-leaf', description: 'An eco-friendly retreat center with sustainable practices' }
  ];
  selectedPlaceType: string | null = null;
  
  // Step 2: Location
  locationForm!: FormGroup;
  
  // Step 3: Basics
  basicsForm!: FormGroup;
  productionOptionsList = ['Rice', 'Wheat', 'Corn', 'Vegetables', 'Fruits', 'Dairy', 'Poultry', 'Goats', 'Sheep', 'Fish', 'Organic Produce'];
  
  // Step 4: Amenities
  amenitiesList = [
    { id: 'pond', label: 'Pond / Lake', icon: 'fa-solid fa-water' },
    { id: 'house', label: 'Livable House', icon: 'fa-solid fa-house-chimney' },
    { id: 'electricity', label: 'Electricity', icon: 'fa-solid fa-bolt' },
    { id: 'water_source', label: 'Water Source', icon: 'fa-solid fa-faucet-drip' },
    { id: 'parking', label: 'Parking', icon: 'fa-solid fa-square-parking' },
    { id: 'wifi', label: 'WiFi', icon: 'fa-solid fa-wifi' },
    { id: 'kitchen', label: 'Kitchen', icon: 'fa-solid fa-kitchen-set' },
    { id: 'bathroom', label: 'Bathroom', icon: 'fa-solid fa-shower' }
  ];
  
  // Step 5: Photos
  photoCategories = [
    { key: 'hero', label: 'Hero Shot', required: true },
    { key: 'house_exterior', label: 'House Exterior', required: true },
    { key: 'landscape', label: 'Landscape', required: true },
    { key: 'room', label: 'Rooms', required: true },
    { key: 'kitchen', label: 'Kitchen', required: true },
    { key: 'bathroom', label: 'Bathroom', required: true },
    { key: 'activity_space', label: 'Activity Spaces', required: true },
    { key: 'crops_livestock', label: 'Crops/Livestock', required: true }
  ];
  
  // Step 6: Title & Description
  titleDescriptionForm!: FormGroup;
  
  soilTypes: { value: SoilType; label: string }[] = [
    { value: 'red', label: 'Red Soil' },
    { value: 'black', label: 'Black Soil' },
    { value: 'alluvial', label: 'Alluvial Soil' },
    { value: 'sandy', label: 'Sandy Soil' },
    { value: 'loam', label: 'Loam Soil' },
    { value: 'clay', label: 'Clay Soil' },
    { value: 'other', label: 'Other' }
  ];
  
  showSuccess = false;
  
  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {}
  
  ngOnInit() {
    // Canonical onboarding path is /property/onboard (API-backed).
    this.router.navigate(['/property/onboard'], { queryParams: { new: true }, replaceUrl: true });
    this.initializeForms();
  }
  
  initializeForms() {
    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      village: [''],
      district: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['India', Validators.required],
      latitude: [null],
      longitude: [null]
    });
    
    this.basicsForm = this.fb.group({
      farmSize: [null, [Validators.required, Validators.min(0.1)]],
      soilType: ['', Validators.required],
      production: this.fb.array([], Validators.required),
      guests: [4, [Validators.required, Validators.min(1)]],
      bedrooms: [1, [Validators.required, Validators.min(1)]],
      beds: [1, [Validators.required, Validators.min(1)]],
      bathrooms: [1, [Validators.required, Validators.min(1)]]
    });
    
    this.titleDescriptionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(500)]]
    });
  }
  
  get productionArray(): FormArray {
    return this.basicsForm.get('production') as FormArray;
  }
  
  // Step 0: Select Host Type
  selectHostType(type: 'farm') {
    this.selectedHostType = type;
    this.nextStep();
  }
  
  // Step 1: Select Place Type
  selectPlaceType(type: string) {
    this.selectedPlaceType = type;
  }
  
  // Step 2: Location
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }
  
  // Step 3: Basics
  toggleProduction(option: string) {
    const productionArray = this.productionArray;
    const index = productionArray.controls.findIndex(x => x.value === option);
    
    if (index >= 0) {
      productionArray.removeAt(index);
    } else {
      productionArray.push(this.fb.control(option));
    }
  }
  
  isProductionSelected(option: string): boolean {
    return this.productionArray.value.includes(option);
  }
  
  // Step 4: Amenities
  selectedAmenities: string[] = [];
  
  toggleAmenity(amenityId: string) {
    const index = this.selectedAmenities.indexOf(amenityId);
    if (index >= 0) {
      this.selectedAmenities.splice(index, 1);
    } else {
      this.selectedAmenities.push(amenityId);
    }
  }
  
  isAmenitySelected(amenityId: string): boolean {
    return this.selectedAmenities.includes(amenityId);
  }
  
  // Step 5: Photos
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.uploadedPhotos.length < 10) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.uploadedPhotos.push({ file, preview: e.target.result, category: null });
          };
          reader.readAsDataURL(file);
        } else {
          alert('Maximum 10 photos allowed.');
          break;
        }
      }
    }
  }
  
  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
  }
  
  getTotalUploadedPhotos(): number {
    return this.uploadedPhotos.length;
  }
  
  getRequiredPhotosCount(): number {
    return this.photoCategories.filter(c => c.required).length;
  }
  
  // Navigation
  nextStep() {
    if (this.isCurrentStepValid()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    } else {
      this.markCurrentStepTouched();
      alert('Please complete all required fields before proceeding.');
    }
  }
  
  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  
  isCurrentStepValid(): boolean {
    switch(this.currentStep) {
      case 0: // Host Type
        return this.selectedHostType !== null;
      case 1: // Place Type
        return this.selectedPlaceType !== null;
      case 2: // Location
        return this.locationForm.valid;
      case 3: // Basics
        return this.basicsForm.valid && this.productionArray.length > 0;
      case 4: // Amenities
        return true; // Optional
      case 5: // Photos
        return this.getTotalUploadedPhotos() >= this.getRequiredPhotosCount();
      case 6: // Title/Description
        return this.titleDescriptionForm.valid;
      case 7: // Review
        return true;
      default:
        return false;
    }
  }
  
  markCurrentStepTouched() {
    switch(this.currentStep) {
      case 2:
        this.locationForm.markAllAsTouched();
        break;
      case 3:
        this.basicsForm.markAllAsTouched();
        break;
      case 6:
        this.titleDescriptionForm.markAllAsTouched();
        break;
    }
  }
  
  submitOnboarding() {
    if (!this.isCurrentStepValid()) {
      alert('Please complete all required fields.');
      return;
    }
    
    const formData = {
      hostType: this.selectedHostType,
      placeType: this.selectedPlaceType,
      location: this.locationForm.value,
      basics: this.basicsForm.value,
      amenities: this.selectedAmenities,
      photos: this.uploadedPhotos,
      titleDescription: this.titleDescriptionForm.value
    };
    
    console.log('Submitting farm onboarding:', formData);
    this.showSuccess = true;
    
    setTimeout(() => {
      this.router.navigate(['/partner/onboarding/confirmation']);
    }, 2000);
  }
  
  getStepTitle(): string {
    const titles = [
      "What would you like to host?",
      "Which of these best describes your place?",
      "Where's your place located?",
      "Share some basics about your place",
      "Tell guests what your place has to offer",
      "Add some photos of your place",
      "Create your listing title and description",
      "Review your listing"
    ];
    return titles[this.currentStep] || '';
  }
  
  getStepDescription(): string {
    const descriptions = [
      "Choose how you'd like to share your space with guests",
      "Select the type that best matches your property",
      "Your address is only shared with guests after they've made a reservation",
      "You'll add more details later, such as bed types",
      "You can add more amenities after you publish your listing",
      "You'll need at least 8 photos to get started. You can add more or make changes later",
      "Short titles work best. Have fun with it—you can always change it later",
      "Make sure everything looks good, then publish your listing"
    ];
    return descriptions[this.currentStep] || '';
  }
  
  // Helper methods for template
  getMax(a: number, b: number): number {
    return Math.max(a, b);
  }
  
  getPlaceTypeLabel(): string {
    const placeType = this.placeTypes.find(p => p.id === this.selectedPlaceType);
    return placeType?.label || '';
  }
  
  getSelectedAmenitiesLabel(): string {
    if (this.selectedAmenities.length === 0) {
      return 'None selected';
    }
    return this.amenitiesList
      .filter(a => this.selectedAmenities.includes(a.id))
      .map(a => a.label)
      .join(', ');
  }
  
  decrementGuests() {
    const current = this.basicsForm.get('guests')?.value || 1;
    this.basicsForm.patchValue({ guests: Math.max(1, current - 1) });
  }
  
  incrementGuests() {
    const current = this.basicsForm.get('guests')?.value || 1;
    this.basicsForm.patchValue({ guests: current + 1 });
  }
  
  decrementBedrooms() {
    const current = this.basicsForm.get('bedrooms')?.value || 1;
    this.basicsForm.patchValue({ bedrooms: Math.max(1, current - 1) });
  }
  
  incrementBedrooms() {
    const current = this.basicsForm.get('bedrooms')?.value || 1;
    this.basicsForm.patchValue({ bedrooms: current + 1 });
  }
  
  decrementBeds() {
    const current = this.basicsForm.get('beds')?.value || 1;
    this.basicsForm.patchValue({ beds: Math.max(1, current - 1) });
  }
  
  incrementBeds() {
    const current = this.basicsForm.get('beds')?.value || 1;
    this.basicsForm.patchValue({ beds: current + 1 });
  }
  
  decrementBathrooms() {
    const current = this.basicsForm.get('bathrooms')?.value || 1;
    this.basicsForm.patchValue({ bathrooms: Math.max(1, current - 1) });
  }
  
  incrementBathrooms() {
    const current = this.basicsForm.get('bathrooms')?.value || 1;
    this.basicsForm.patchValue({ bathrooms: current + 1 });
  }
}
