import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
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
}
