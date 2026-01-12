import { createAction, props } from '@ngrx/store';
import { Property, Category, PropertyAvailability, PropertyPricing, PropertyReview, PropertySearchRequest, PropertySearchResponse, PropertyCreateRequest } from '../../models/property.model';

// Property Management
export const createProperty = createAction(
  '[Property] Create Property',
  props<{ propertyData: PropertyCreateRequest }>()
);

export const createPropertySuccess = createAction(
  '[Property] Create Property Success',
  props<{ property: Property; message: string }>()
);

export const getMyProperties = createAction('[Property] Get My Properties');

export const getMyPropertiesSuccess = createAction(
  '[Property] Get My Properties Success',
  props<{ properties: Property[]; message: string }>()
);

export const getMyPropertiesFailure = createAction(
  '[Property] Get My Properties Failure',
  props<{ error: string }>()
);

export const updatePropertyState = createAction(
  '[Property] Update Property State',
  props<{ propertyId: string; state: number; reason?: string }>()
);

export const updatePropertyStateSuccess = createAction(
  '[Property] Update Property State Success',
  props<{ message: string }>()
);

export const updatePropertyStateFailure = createAction(
  '[Property] Update Property State Failure',
  props<{ error: string }>()
);

export const addWaterSource = createAction(
  '[Property] Add Water Source',
  props<{ propertyId: string; sourceCode: number }>()
);

export const addWaterSourceSuccess = createAction(
  '[Property] Add Water Source Success',
  props<{ message: string }>()
);

export const addWaterSourceFailure = createAction(
  '[Property] Add Water Source Failure',
  props<{ error: string }>()
);

export const addIrrigationSystem = createAction(
  '[Property] Add Irrigation System',
  props<{ propertyId: string; systemCode: number }>()
);

export const addIrrigationSystemSuccess = createAction(
  '[Property] Add Irrigation System Success',
  props<{ message: string }>()
);

export const addIrrigationSystemFailure = createAction(
  '[Property] Add Irrigation System Failure',
  props<{ error: string }>()
);

export const addPestManagement = createAction(
  '[Property] Add Pest Management',
  props<{ propertyId: string; methodCode: number }>()
);

export const addPestManagementSuccess = createAction(
  '[Property] Add Pest Management Success',
  props<{ message: string }>()
);

export const addPestManagementFailure = createAction(
  '[Property] Add Pest Management Failure',
  props<{ error: string }>()
);

export const addSafetyEquipment = createAction(
  '[Property] Add Safety Equipment',
  props<{ propertyId: string; equipmentCode: number }>()
);

export const addSafetyEquipmentSuccess = createAction(
  '[Property] Add Safety Equipment Success',
  props<{ message: string }>()
);

export const addSafetyEquipmentFailure = createAction(
  '[Property] Add Safety Equipment Failure',
  props<{ error: string }>()
);

export const createPropertyFailure = createAction(
  '[Property] Create Property Failure',
  props<{ error: string }>()
);

export const getProperty = createAction(
  '[Property] Get Property',
  props<{ propertyId: string }>()
);

export const getPropertySuccess = createAction(
  '[Property] Get Property Success',
  props<{ property: Property }>()
);

export const getPropertyFailure = createAction(
  '[Property] Get Property Failure',
  props<{ error: string }>()
);

export const updateProperty = createAction(
  '[Property] Update Property',
  props<{ propertyId: string; updates: Partial<Property> }>()
);

export const updatePropertySuccess = createAction(
  '[Property] Update Property Success',
  props<{ property: Property }>()
);

export const updatePropertyFailure = createAction(
  '[Property] Update Property Failure',
  props<{ error: string }>()
);

export const deleteProperty = createAction(
  '[Property] Delete Property',
  props<{ propertyId: string }>()
);

export const deletePropertySuccess = createAction(
  '[Property] Delete Property Success',
  props<{ message: string }>()
);

export const deletePropertyFailure = createAction(
  '[Property] Delete Property Failure',
  props<{ error: string }>()
);

export const listProperties = createAction(
  '[Property] List Properties',
  props<{ 
    page?: number; 
    limit?: number; 
    partnerId?: string; 
    categoryId?: string; 
    propertyType?: string; 
    status?: string;
    city?: string;
    country?: string;
    sortBy?: string;
    sortOrder?: string;
  }>()
);

export const listPropertiesSuccess = createAction(
  '[Property] List Properties Success',
  props<{ properties: Property[]; total: number; page: number; limit: number }>()
);

export const listPropertiesFailure = createAction(
  '[Property] List Properties Failure',
  props<{ error: string }>()
);

// Property Search
export const searchProperties = createAction(
  '[Property] Search Properties',
  props<{ searchRequest: PropertySearchRequest }>()
);

export const searchPropertiesSuccess = createAction(
  '[Property] Search Properties Success',
  props<{ searchResponse: PropertySearchResponse }>()
);

export const searchPropertiesFailure = createAction(
  '[Property] Search Properties Failure',
  props<{ error: string }>()
);

export const setSearchQuery = createAction(
  '[Property] Set Search Query',
  props<{ query: string }>()
);

export const setPropertyFilters = createAction(
  '[Property] Set Filters',
  props<{ filters: Partial<PropertySearchRequest> }>()
);

// Categories
export const loadCategories = createAction(
  '[Property] Load Categories',
  props<{ parentId?: string; activeOnly?: boolean }>()
);

export const loadCategoriesSuccess = createAction(
  '[Property] Load Categories Success',
  props<{ categories: Category[] }>()
);

export const loadCategoriesFailure = createAction(
  '[Property] Load Categories Failure',
  props<{ error: string }>()
);

// Availability Management
export const updateAvailability = createAction(
  '[Property] Update Availability',
  props<{ propertyId: string; slots: any[] }>()
);

export const updateAvailabilitySuccess = createAction(
  '[Property] Update Availability Success',
  props<{ updatedAvailability: PropertyAvailability[] }>()
);

export const updateAvailabilityFailure = createAction(
  '[Property] Update Availability Failure',
  props<{ error: string }>()
);

export const getAvailability = createAction(
  '[Property] Get Availability',
  props<{ propertyId: string; startDate: string; endDate: string }>()
);

export const getAvailabilitySuccess = createAction(
  '[Property] Get Availability Success',
  props<{ availability: PropertyAvailability[] }>()
);

export const getAvailabilityFailure = createAction(
  '[Property] Get Availability Failure',
  props<{ error: string }>()
);

export const checkAvailability = createAction(
  '[Property] Check Availability',
  props<{ propertyId: string; startDate: string; endDate: string; guests: number }>()
);

export const checkAvailabilitySuccess = createAction(
  '[Property] Check Availability Success',
  props<{ available: boolean; totalPrice: number; availableDates: any[] }>()
);

export const checkAvailabilityFailure = createAction(
  '[Property] Check Availability Failure',
  props<{ error: string }>()
);

// Pricing Management
export const updatePricing = createAction(
  '[Property] Update Pricing',
  props<{ propertyId: string; pricingData: Partial<PropertyPricing> }>()
);

export const updatePricingSuccess = createAction(
  '[Property] Update Pricing Success',
  props<{ pricing: PropertyPricing }>()
);

export const updatePricingFailure = createAction(
  '[Property] Update Pricing Failure',
  props<{ error: string }>()
);

export const getPricing = createAction(
  '[Property] Get Pricing',
  props<{ propertyId: string; startDate?: string; endDate?: string; guests?: number }>()
);

export const getPricingSuccess = createAction(
  '[Property] Get Pricing Success',
  props<{ pricing: PropertyPricing; calculatedPrice: number; breakdown: any[] }>()
);

export const getPricingFailure = createAction(
  '[Property] Get Pricing Failure',
  props<{ error: string }>()
);

// Media Management
export const uploadMedia = createAction(
  '[Property] Upload Media',
  props<{ propertyId: string; files: File[]; mediaType: string }>()
);

export const uploadMediaSuccess = createAction(
  '[Property] Upload Media Success',
  props<{ media: any[] }>()
);

export const uploadMediaFailure = createAction(
  '[Property] Upload Media Failure',
  props<{ error: string }>()
);

export const deleteMedia = createAction(
  '[Property] Delete Media',
  props<{ mediaId: string }>()
);

export const deleteMediaSuccess = createAction(
  '[Property] Delete Media Success',
  props<{ message: string }>()
);

export const deleteMediaFailure = createAction(
  '[Property] Delete Media Failure',
  props<{ error: string }>()
);

export const listMedia = createAction(
  '[Property] List Media',
  props<{ propertyId: string; type?: string }>()
);

export const listMediaSuccess = createAction(
  '[Property] List Media Success',
  props<{ media: any[] }>()
);

export const listMediaFailure = createAction(
  '[Property] List Media Failure',
  props<{ error: string }>()
);

// Reviews & Ratings
export const addReview = createAction(
  '[Property] Add Review',
  props<{ reviewData: Omit<PropertyReview, 'id' | 'createdAt' | 'updatedAt'> }>()
);

export const addReviewSuccess = createAction(
  '[Property] Add Review Success',
  props<{ review: PropertyReview }>()
);

export const addReviewFailure = createAction(
  '[Property] Add Review Failure',
  props<{ error: string }>()
);

export const getReviews = createAction(
  '[Property] Get Reviews',
  props<{ propertyId: string; page?: number; limit?: number; minRating?: number; sortBy?: string }>()
);

export const getReviewsSuccess = createAction(
  '[Property] Get Reviews Success',
  props<{ reviews: PropertyReview[]; total: number; averageRating: number; page: number; limit: number }>()
);

export const getReviewsFailure = createAction(
  '[Property] Get Reviews Failure',
  props<{ error: string }>()
);

export const updateReview = createAction(
  '[Property] Update Review',
  props<{ reviewId: string; updates: Partial<PropertyReview> }>()
);

export const updateReviewSuccess = createAction(
  '[Property] Update Review Success',
  props<{ review: PropertyReview }>()
);

export const updateReviewFailure = createAction(
  '[Property] Update Review Failure',
  props<{ error: string }>()
);

// Utility Actions
export const resetPropertySuccessStates = createAction('[Property] Reset Success States');
export const clearPropertyErrors = createAction('[Property] Clear Errors');
export const loadFeaturedProperties = createAction('[Property] Load Featured Properties');
export const loadFeaturedPropertiesSuccess = createAction(
  '[Property] Load Featured Properties Success',
  props<{ properties: Property[] }>()
);
export const loadFeaturedPropertiesFailure = createAction(
  '[Property] Load Featured Properties Failure',
  props<{ error: string }>()
);
