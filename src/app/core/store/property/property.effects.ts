import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { PropertyService } from '../../services/property.service';
import * as PropertyActions from './property.actions';

@Injectable()
export class PropertyEffects {
  private actions$ = inject(Actions);
  private propertyService = inject(PropertyService);

  // Create Property Effect
  createProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.createProperty),
      mergeMap(({ propertyData }) => {
        console.log('PropertyEffects: Creating property with data:', propertyData);
        return this.propertyService.createProperty(propertyData).pipe(
          map(response => {
            console.log('PropertyEffects: Received response:', response);
            // Backend returns: { success: true, message: "...", data: Property }
            const property = response.data;
            const message = response.message || 'Property created successfully';
            if (!property) {
              console.error('PropertyEffects: Property data not found in response:', response);
              throw new Error('Property data not found in response');
            }
            console.log('PropertyEffects: Dispatching success with property:', property);
            return PropertyActions.createPropertySuccess({
              property: property,
              message: message
            });
          }),
          catchError(error => {
            console.error('PropertyEffects: Error creating property:', error);
            console.error('PropertyEffects: Error details:', {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              message: error.message
            });
            const errorMessage = error.error?.error || error.error?.message || error.message || 'Failed to create property';
            return of(PropertyActions.createPropertyFailure({ 
              error: errorMessage
            }));
          })
        );
      })
    )
  );

  // Get My Properties Effect
  getMyProperties$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.getMyProperties),
      mergeMap(() =>
        this.propertyService.getMyProperties().pipe(
          map(response => {
            console.log('PropertyEffects: getMyProperties response:', response);
            // Handle null data from backend - convert to empty array
            const properties = response.data || [];
            console.log('PropertyEffects: Extracted properties:', properties.length, properties);
            return PropertyActions.getMyPropertiesSuccess({
              properties: properties,
              message: response.message
            });
          }),
          catchError(error => {
            console.error('PropertyEffects: Error getting properties:', error);
            return of(PropertyActions.getMyPropertiesFailure({ 
              error: error.error?.message || 'Failed to get properties' 
            }));
          })
        )
      )
    )
  );

  // Update Property State Effect
  updatePropertyState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.updatePropertyState),
      mergeMap(({ propertyId, state, reason }) =>
        this.propertyService.updatePropertyState(propertyId, state, reason).pipe(
          map(response => 
            PropertyActions.updatePropertyStateSuccess({
              message: response.message
            })
          ),
          catchError(error => 
            of(PropertyActions.updatePropertyStateFailure({ 
              error: error.error?.message || 'Failed to update property state' 
            }))
          )
        )
      )
    )
  );

  // Add Water Source Effect
  addWaterSource$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.addWaterSource),
      mergeMap(({ propertyId, sourceCode }) =>
        this.propertyService.addWaterSource(propertyId, sourceCode).pipe(
          map(response => 
            PropertyActions.addWaterSourceSuccess({
              message: response.message
            })
          ),
          catchError(error => 
            of(PropertyActions.addWaterSourceFailure({ 
              error: error.error?.message || 'Failed to add water source' 
            }))
          )
        )
      )
    )
  );

  // Add Irrigation System Effect
  addIrrigationSystem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.addIrrigationSystem),
      mergeMap(({ propertyId, systemCode }) =>
        this.propertyService.addIrrigationSystem(propertyId, systemCode).pipe(
          map(response => 
            PropertyActions.addIrrigationSystemSuccess({
              message: response.message
            })
          ),
          catchError(error => 
            of(PropertyActions.addIrrigationSystemFailure({ 
              error: error.error?.message || 'Failed to add irrigation system' 
            }))
          )
        )
      )
    )
  );

  // Add Pest Management Effect
  addPestManagement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.addPestManagement),
      mergeMap(({ propertyId, methodCode }) =>
        this.propertyService.addPestManagement(propertyId, methodCode).pipe(
          map(response => 
            PropertyActions.addPestManagementSuccess({
              message: response.message
            })
          ),
          catchError(error => 
            of(PropertyActions.addPestManagementFailure({ 
              error: error.error?.message || 'Failed to add pest management' 
            }))
          )
        )
      )
    )
  );

  // Add Safety Equipment Effect
  addSafetyEquipment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.addSafetyEquipment),
      mergeMap(({ propertyId, equipmentCode }) =>
        this.propertyService.addSafetyEquipment(propertyId, equipmentCode).pipe(
          map(response => 
            PropertyActions.addSafetyEquipmentSuccess({
              message: response.message
            })
          ),
          catchError(error => 
            of(PropertyActions.addSafetyEquipmentFailure({ 
              error: error.error?.message || 'Failed to add safety equipment' 
            }))
          )
        )
      )
    )
  );

  // Get Property Effect
  getProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.getProperty),
      mergeMap(({ propertyId }) =>
        this.propertyService.getProperty(propertyId).pipe(
          map(response => 
            PropertyActions.getPropertySuccess({ property: response.data })
          ),
          catchError(error => 
            of(PropertyActions.getPropertyFailure({ 
              error: error.error?.message || 'Failed to get property' 
            }))
          )
        )
      )
    )
  );

  // Update Property Effect
  updateProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.updateProperty),
      mergeMap(({ propertyId, updates }) =>
        this.propertyService.updateProperty(propertyId, updates).pipe(
          map(property => 
            PropertyActions.updatePropertySuccess({ property })
          ),
          catchError(error => 
            of(PropertyActions.updatePropertyFailure({ 
              error: error.error?.message || 'Failed to update property' 
            }))
          )
        )
      )
    )
  );

  // Delete Property Effect
  deleteProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.deleteProperty),
      mergeMap(({ propertyId }) =>
        this.propertyService.deleteProperty(propertyId).pipe(
          map(response => 
            PropertyActions.deletePropertySuccess({ 
              message: response.message 
            })
          ),
          catchError(error => 
            of(PropertyActions.deletePropertyFailure({ 
              error: error.error?.message || 'Failed to delete property' 
            }))
          )
        )
      )
    )
  );

  // List Properties Effect
  listProperties$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.listProperties),
      mergeMap(({ page, limit, partnerId, categoryId, propertyType, status, city, country, sortBy, sortOrder }) =>
        this.propertyService.listProperties({ 
          page, 
          limit, 
          partnerId, 
          categoryId, 
          propertyType, 
          status,
          city,
          country,
          sortBy,
          sortOrder 
        }).pipe(
          map(response => 
            PropertyActions.listPropertiesSuccess({
              properties: response.properties,
              total: response.total,
              page: response.page,
              limit: response.limit
            })
          ),
          catchError(error => 
            of(PropertyActions.listPropertiesFailure({ 
              error: error.error?.message || 'Failed to list properties' 
            }))
          )
        )
      )
    )
  );

  // Search Properties Effect
  searchProperties$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.searchProperties),
      mergeMap(({ searchRequest }) =>
        this.propertyService.searchProperties(searchRequest).pipe(
          map(searchResponse => 
            PropertyActions.searchPropertiesSuccess({ searchResponse })
          ),
          catchError(error => 
            of(PropertyActions.searchPropertiesFailure({ 
              error: error.error?.message || 'Failed to search properties' 
            }))
          )
        )
      )
    )
  );

  // Load Categories Effect
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.loadCategories),
      mergeMap(({ parentId, activeOnly }) =>
        this.propertyService.listCategories({ parentId, activeOnly }).pipe(
          map(categories => 
            PropertyActions.loadCategoriesSuccess({ categories })
          ),
          catchError(error => 
            of(PropertyActions.loadCategoriesFailure({ 
              error: error.error?.message || 'Failed to load categories' 
            }))
          )
        )
      )
    )
  );

  // Update Availability Effect
  updateAvailability$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.updateAvailability),
      mergeMap(({ propertyId, slots }) =>
        this.propertyService.updateAvailability(propertyId, slots).pipe(
          map(response => 
            PropertyActions.updateAvailabilitySuccess({ 
              updatedAvailability: response.updated_availability 
            })
          ),
          catchError(error => 
            of(PropertyActions.updateAvailabilityFailure({ 
              error: error.error?.message || 'Failed to update availability' 
            }))
          )
        )
      )
    )
  );

  // Get Availability Effect
  getAvailability$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.getAvailability),
      mergeMap(({ propertyId, startDate, endDate }) =>
        this.propertyService.getAvailability(propertyId, startDate, endDate).pipe(
          map(availability => 
            PropertyActions.getAvailabilitySuccess({ availability })
          ),
          catchError(error => 
            of(PropertyActions.getAvailabilityFailure({ 
              error: error.error?.message || 'Failed to get availability' 
            }))
          )
        )
      )
    )
  );

  // Check Availability Effect
  checkAvailability$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.checkAvailability),
      mergeMap(({ propertyId, startDate, endDate, guests }) =>
        this.propertyService.checkAvailability(propertyId, startDate, endDate, guests).pipe(
          map(response => 
            PropertyActions.checkAvailabilitySuccess({ 
              available: response.available,
              totalPrice: response.total_price,
              availableDates: response.available_dates
            })
          ),
          catchError(error => 
            of(PropertyActions.checkAvailabilityFailure({ 
              error: error.error?.message || 'Failed to check availability' 
            }))
          )
        )
      )
    )
  );

  // Update Pricing Effect
  updatePricing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.updatePricing),
      mergeMap(({ propertyId, pricingData }) =>
        this.propertyService.updatePricing(propertyId, pricingData).pipe(
          map(pricing => 
            PropertyActions.updatePricingSuccess({ pricing })
          ),
          catchError(error => 
            of(PropertyActions.updatePricingFailure({ 
              error: error.error?.message || 'Failed to update pricing' 
            }))
          )
        )
      )
    )
  );

  // Get Pricing Effect
  getPricing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.getPricing),
      mergeMap(({ propertyId, startDate, endDate, guests }) =>
        this.propertyService.getPricing(propertyId, startDate, endDate, guests).pipe(
          map(response => 
            PropertyActions.getPricingSuccess({ 
              pricing: response.pricing,
              calculatedPrice: response.calculated_price,
              breakdown: response.breakdown
            })
          ),
          catchError(error => 
            of(PropertyActions.getPricingFailure({ 
              error: error.error?.message || 'Failed to get pricing' 
            }))
          )
        )
      )
    )
  );

  // Upload Media Effect
  uploadMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.uploadMedia),
      mergeMap(({ propertyId, files, type }) =>
        this.propertyService.uploadMedia(propertyId, files, type).pipe(
          map(media => 
            PropertyActions.uploadMediaSuccess({ media })
          ),
          catchError(error => 
            of(PropertyActions.uploadMediaFailure({ 
              error: error.error?.message || 'Failed to upload media' 
            }))
          )
        )
      )
    )
  );

  // Delete Media Effect
  deleteMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.deleteMedia),
      mergeMap(({ mediaId }) =>
        this.propertyService.deleteMedia(mediaId).pipe(
          map(response => 
            PropertyActions.deleteMediaSuccess({ 
              message: response.message 
            })
          ),
          catchError(error => 
            of(PropertyActions.deleteMediaFailure({ 
              error: error.error?.message || 'Failed to delete media' 
            }))
          )
        )
      )
    )
  );

  // List Media Effect
  listMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.listMedia),
      mergeMap(({ propertyId, type }) =>
        this.propertyService.listMedia(propertyId, type).pipe(
          map(media => 
            PropertyActions.listMediaSuccess({ media })
          ),
          catchError(error => 
            of(PropertyActions.listMediaFailure({ 
              error: error.error?.message || 'Failed to list media' 
            }))
          )
        )
      )
    )
  );

  // Add Review Effect
  addReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.addReview),
      mergeMap(({ reviewData }) =>
        this.propertyService.addReview(reviewData).pipe(
          map(review => 
            PropertyActions.addReviewSuccess({ review })
          ),
          catchError(error => 
            of(PropertyActions.addReviewFailure({ 
              error: error.error?.message || 'Failed to add review' 
            }))
          )
        )
      )
    )
  );

  // Get Reviews Effect
  getReviews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.getReviews),
      mergeMap(({ propertyId, page, limit, minRating, sortBy }) =>
        this.propertyService.getReviews(propertyId, page, limit, minRating, sortBy).pipe(
          map(response => 
            PropertyActions.getReviewsSuccess({ 
              reviews: response.reviews,
              total: response.total,
              averageRating: response.average_rating,
              page: response.page,
              limit: response.limit
            })
          ),
          catchError(error => 
            of(PropertyActions.getReviewsFailure({ 
              error: error.error?.message || 'Failed to get reviews' 
            }))
          )
        )
      )
    )
  );

  // Update Review Effect
  updateReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.updateReview),
      mergeMap(({ reviewId, updates }) =>
        this.propertyService.updateReview(reviewId, updates).pipe(
          map(review => 
            PropertyActions.updateReviewSuccess({ review })
          ),
          catchError(error => 
            of(PropertyActions.updateReviewFailure({ 
              error: error.error?.message || 'Failed to update review' 
            }))
          )
        )
      )
    )
  );

  // Load Featured Properties Effect
  loadFeaturedProperties$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.loadFeaturedProperties),
      mergeMap(() =>
        this.propertyService.listProperties({ featured: true, limit: 10 }).pipe(
          map(response => 
            PropertyActions.loadFeaturedPropertiesSuccess({ 
              properties: response.properties 
            })
          ),
          catchError(error => 
            of(PropertyActions.loadFeaturedPropertiesFailure({ 
              error: error.error?.message || 'Failed to load featured properties' 
            }))
          )
        )
      )
    )
  );
}
