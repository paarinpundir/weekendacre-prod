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

  // Reset Success States
  on(PropertyActions.resetPropertySuccessStates, (state): PropertyState => ({
    ...state,
    createSuccess: false,
    updateSuccess: false,
    createdProperty: null,
  })),

  // Clear Errors
  on(PropertyActions.clearPropertyErrors, (state): PropertyState => ({
    ...state,
    createError: null,
    updateError: null,
    error: null,
  })),

  // Get My Properties
  on(PropertyActions.getMyProperties, (state): PropertyState => ({
    ...state,
    loading: true,
  })),

  on(PropertyActions.getMyPropertiesSuccess, (state, { properties }): PropertyState =>
    propertyAdapter.setAll(properties, {
      ...state,
      loading: false,
      error: null,
    })
  ),

  on(PropertyActions.getMyPropertiesFailure, (state, { error }): PropertyState => ({
    ...state,
    loading: false,
    error,
  })),

  // Add Water Source
  on(PropertyActions.addWaterSource, (state): PropertyState => ({
    ...state,
    updateLoading: true,
  })),

  on(PropertyActions.addWaterSourceSuccess, (state): PropertyState => ({
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

  on(PropertyActions.addIrrigationSystemSuccess, (state): PropertyState => ({
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

  on(PropertyActions.addPestManagementSuccess, (state): PropertyState => ({
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

  on(PropertyActions.addSafetyEquipmentSuccess, (state): PropertyState => ({
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
