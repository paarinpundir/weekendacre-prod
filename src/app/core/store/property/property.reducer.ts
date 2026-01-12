import { createReducer, on, Action } from '@ngrx/store';
import { propertyAdapter, initialPropertyState, PropertyState } from './property.state';
import * as PropertyActions from './property.actions';

export type { PropertyState } from './property.state';

export const propertyReducer = createReducer(
  initialPropertyState,

  // Create Property
  on(PropertyActions.createProperty, (state): PropertyState => ({
    ...state,
    createLoading: true,
    createError: null,
  })),
  
  on(PropertyActions.createPropertySuccess, (state, { property }): PropertyState => 
    propertyAdapter.addOne(property, {
      ...state,
      createLoading: false,
      createSuccess: true,
      createError: null,
      createdProperty: property,
    })
  ),
  
  on(PropertyActions.createPropertyFailure, (state, { error }): PropertyState => ({
    ...state,
    createLoading: false,
    createError: error,
  })),

  // Load Property
  on(PropertyActions.getProperty, (state): PropertyState => ({
    ...state,
    loading: true,
  })),
  
  on(PropertyActions.getPropertySuccess, (state, { property }): PropertyState => 
    propertyAdapter.setOne(property, {
      ...state,
      currentProperty: property,
      loading: false,
    })
  ),
  
  on(PropertyActions.getPropertyFailure, (state, { error }): PropertyState => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Property
  on(PropertyActions.updateProperty, (state): PropertyState => ({
    ...state,
    updateLoading: true,
    updateError: null,
  })),
  
  on(PropertyActions.updatePropertySuccess, (state, { property }): PropertyState => 
    propertyAdapter.updateOne(
      { id: property.id, changes: property },
      {
        ...state,
        currentProperty: property,
        updateLoading: false,
        updateSuccess: true,
        updateError: null,
      }
    )
  ),
  
  on(PropertyActions.updatePropertyFailure, (state, { error }): PropertyState => ({
    ...state,
    updateLoading: false,
    updateError: error,
  })),

  // Delete Property
  on(PropertyActions.deleteProperty, (state): PropertyState => ({
    ...state,
    deleteLoading: true,
    deleteError: null,
  })),
  
  on(PropertyActions.deletePropertySuccess, (state, { message }): PropertyState => {
    // Assuming we have the property ID in the action or state
    return {
      ...state,
      deleteLoading: false,
      deleteSuccess: true,
      deleteError: null,
    };
  }),
  
  on(PropertyActions.deletePropertyFailure, (state, { error }): PropertyState => ({
    ...state,
    deleteLoading: false,
    deleteError: error,
  })),

  // List Properties
  on(PropertyActions.listProperties, (state): PropertyState => ({
    ...state,
    loading: true,
  })),
  
  on(PropertyActions.listPropertiesSuccess, (state, { properties, total, page, limit }): PropertyState => 
    propertyAdapter.setAll(properties, {
      ...state,
      total,
      page,
      limit,
      loading: false,
    })
  ),
  
  on(PropertyActions.listPropertiesFailure, (state, { error }): PropertyState => ({
    ...state,
    loading: false,
    error,
  })),

  // Search Properties
  on(PropertyActions.searchProperties, (state): PropertyState => ({
    ...state,
    searchLoading: true,
    searchError: null,
  })),
  
  on(PropertyActions.searchPropertiesSuccess, (state, { searchResponse }): PropertyState => ({
    ...state,
    searchResults: searchResponse.properties,
    total: searchResponse.total,
    page: searchResponse.page,
    limit: searchResponse.limit,
    searchLoading: false,
    searchError: null,
    suggestions: searchResponse.suggestions || [],
  })),
  
  on(PropertyActions.searchPropertiesFailure, (state, { error }): PropertyState => ({
    ...state,
    searchLoading: false,
    searchError: error,
  })),

  // Load Categories
  on(PropertyActions.loadCategories, (state): PropertyState => ({
    ...state,
    categoriesLoading: true,
    categoriesError: null,
  })),
  
  on(PropertyActions.loadCategoriesSuccess, (state, { categories }): PropertyState => ({
    ...state,
    categories,
    categoriesLoading: false,
    categoriesError: null,
  })),
  
  on(PropertyActions.loadCategoriesFailure, (state, { error }): PropertyState => ({
    ...state,
    categoriesLoading: false,
    categoriesError: error,
  })),

  // Update Availability
  on(PropertyActions.updateAvailability, (state): PropertyState => ({
    ...state,
    availabilityLoading: true,
  })),
  
  on(PropertyActions.updateAvailabilitySuccess, (state, { updatedAvailability }): PropertyState => {
    const newAvailability = { ...state.availability };
    updatedAvailability.forEach(slot => {
      newAvailability[slot.propertyId] = newAvailability[slot.propertyId] || [];
      newAvailability[slot.propertyId] = newAvailability[slot.propertyId].filter(
        s => s.date !== slot.date
      ).concat(slot);
    });
    
    return {
      ...state,
      availability: newAvailability,
      availabilityLoading: false,
    };
  }),
  
  on(PropertyActions.updateAvailabilityFailure, (state, { error }): PropertyState => ({
    ...state,
    availabilityLoading: false,
    error,
  })),

  // Get Availability
  on(PropertyActions.getAvailability, (state): PropertyState => ({
    ...state,
    availabilityLoading: true,
  })),
  
  on(PropertyActions.getAvailabilitySuccess, (state, { availability }): PropertyState => {
    const newAvailability = { ...state.availability };
    newAvailability[availability[0]?.propertyId] = availability;
    
    return {
      ...state,
      availability: newAvailability,
      availabilityLoading: false,
    };
  }),
  
  on(PropertyActions.getAvailabilityFailure, (state, { error }): PropertyState => ({
    ...state,
    availabilityLoading: false,
    error,
  })),

  // Update Pricing
  on(PropertyActions.updatePricing, (state): PropertyState => ({
    ...state,
    pricingLoading: true,
  })),
  
  on(PropertyActions.updatePricingSuccess, (state, { pricing }): PropertyState => {
    const newPricing = { ...state.pricing };
    newPricing[pricing.propertyId] = pricing;
    
    return {
      ...state,
      pricing: newPricing,
      pricingLoading: false,
    };
  }),
  
  on(PropertyActions.updatePricingFailure, (state, { error }): PropertyState => ({
    ...state,
    pricingLoading: false,
    error,
  })),

  // Get Pricing
  on(PropertyActions.getPricing, (state): PropertyState => ({
    ...state,
    pricingLoading: true,
  })),
  
  on(PropertyActions.getPricingSuccess, (state, { pricing, calculatedPrice, breakdown }): PropertyState => {
    const newPricing = { ...state.pricing };
    newPricing[pricing.propertyId] = {
      ...pricing,
      calculatedPrice,
      breakdown,
    };
    
    return {
      ...state,
      pricing: newPricing,
      pricingLoading: false,
    };
  }),
  
  on(PropertyActions.getPricingFailure, (state, { error }): PropertyState => ({
    ...state,
    pricingLoading: false,
    error,
  })),

  // Add Review
  on(PropertyActions.addReview, (state): PropertyState => ({
    ...state,
    reviewsLoading: true,
  })),
  
  on(PropertyActions.addReviewSuccess, (state, { review }): PropertyState => {
    const newReviews = { ...state.propertyReviews };
    newReviews[review.propertyId] = newReviews[review.propertyId] || [];
    newReviews[review.propertyId].push(review);
    
    return {
      ...state,
      propertyReviews: newReviews,
      reviewsLoading: false,
    };
  }),
  
  on(PropertyActions.addReviewFailure, (state, { error }): PropertyState => ({
    ...state,
    reviewsLoading: false,
    reviewsError: error,
  })),

  // Get Reviews
  on(PropertyActions.getReviews, (state): PropertyState => ({
    ...state,
    reviewsLoading: true,
  })),
  
  on(PropertyActions.getReviewsSuccess, (state, { reviews, total, averageRating, page, limit }): PropertyState => {
    const newReviews = { ...state.propertyReviews };
    newReviews[reviews[0]?.propertyId] = reviews;
    
    return {
      ...state,
      propertyReviews: newReviews,
      reviewsLoading: false,
    };
  }),
  
  on(PropertyActions.getReviewsFailure, (state, { error }): PropertyState => ({
    ...state,
    reviewsLoading: false,
    reviewsError: error,
  })),

  // Update Review
  on(PropertyActions.updateReview, (state): PropertyState => ({
    ...state,
    reviewsLoading: true,
  })),
  
  on(PropertyActions.updateReviewSuccess, (state, { review }): PropertyState => {
    const newReviews = { ...state.propertyReviews };
    if (newReviews[review.propertyId]) {
      const index = newReviews[review.propertyId].findIndex(r => r.id === review.id);
      if (index !== -1) {
        newReviews[review.propertyId][index] = review;
      }
    }
    
    return {
      ...state,
      propertyReviews: newReviews,
      reviewsLoading: false,
    };
  }),
  
  on(PropertyActions.updateReviewFailure, (state, { error }): PropertyState => ({
    ...state,
    reviewsLoading: false,
    reviewsError: error,
  })),

  // Reset Success States
  on(PropertyActions.resetPropertySuccessStates, (state): PropertyState => ({
    ...state,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
    createdProperty: null,
  })),
  
  // Clear Errors
  on(PropertyActions.clearPropertyErrors, (state): PropertyState => ({
    ...state,
    createError: null,
    updateError: null,
    deleteError: null,
    error: null,
  })),

  // Set Filters
  on(PropertyActions.setPropertyFilters, (state, { filters }): PropertyState => ({
    ...state,
    filters: { ...state.filters, ...filters },
  })),

  // Set Search Query
  on(PropertyActions.setSearchQuery, (state, { query }): PropertyState => ({
    ...state,
    searchQuery: query,
  })),

  // Get My Properties
  on(PropertyActions.getMyProperties, (state): PropertyState => ({
    ...state,
    loading: true,
  })),
  
  on(PropertyActions.getMyPropertiesSuccess, (state, { properties, message }): PropertyState => {
    console.log('PropertyReducer: getMyPropertiesSuccess with', properties.length, 'properties');
    console.log('PropertyReducer: Properties data:', JSON.stringify(properties, null, 2));
    const newState = propertyAdapter.setAll(properties, {
      ...state,
      loading: false,
      error: null,
    });
    console.log('PropertyReducer: New state after setAll:', {
      ids: newState.ids,
      entitiesCount: Object.keys(newState.entities || {}).length,
      entities: newState.entities
    });
    return newState;
  }),
  
  on(PropertyActions.getMyPropertiesFailure, (state, { error }): PropertyState => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Property State
  on(PropertyActions.updatePropertyState, (state): PropertyState => ({
    ...state,
    updateLoading: true,
    updateError: null,
  })),
  
  on(PropertyActions.updatePropertyStateSuccess, (state, { message }): PropertyState => ({
    ...state,
    updateLoading: false,
    updateSuccess: true,
    updateError: null,
  })),
  
  on(PropertyActions.updatePropertyStateFailure, (state, { error }): PropertyState => ({
    ...state,
    updateLoading: false,
    updateError: error,
  })),

  // Add Water Source
  on(PropertyActions.addWaterSource, (state): PropertyState => ({
    ...state,
    updateLoading: true,
  })),
  
  on(PropertyActions.addWaterSourceSuccess, (state, { message }): PropertyState => ({
    ...state,
    updateLoading: false,
  })),
  
  on(PropertyActions.addWaterSourceFailure, (state, { error }): PropertyState => ({
    ...state,
    updateLoading: false,
    error,
  })),

  // Add Irrigation System
  on(PropertyActions.addIrrigationSystem, (state): PropertyState => ({
    ...state,
    updateLoading: true,
  })),
  
  on(PropertyActions.addIrrigationSystemSuccess, (state, { message }): PropertyState => ({
    ...state,
    updateLoading: false,
  })),
  
  on(PropertyActions.addIrrigationSystemFailure, (state, { error }): PropertyState => ({
    ...state,
    updateLoading: false,
    error,
  })),

  // Add Pest Management
  on(PropertyActions.addPestManagement, (state): PropertyState => ({
    ...state,
    updateLoading: true,
  })),
  
  on(PropertyActions.addPestManagementSuccess, (state, { message }): PropertyState => ({
    ...state,
    updateLoading: false,
  })),
  
  on(PropertyActions.addPestManagementFailure, (state, { error }): PropertyState => ({
    ...state,
    updateLoading: false,
    error,
  })),

  // Add Safety Equipment
  on(PropertyActions.addSafetyEquipment, (state): PropertyState => ({
    ...state,
    updateLoading: true,
  })),
  
  on(PropertyActions.addSafetyEquipmentSuccess, (state, { message }): PropertyState => ({
    ...state,
    updateLoading: false,
  })),
  
  on(PropertyActions.addSafetyEquipmentFailure, (state, { error }): PropertyState => ({
    ...state,
    updateLoading: false,
    error,
  }))
);

export function reducer(state: PropertyState | undefined, action: Action): PropertyState {
  return propertyReducer(state, action);
}
