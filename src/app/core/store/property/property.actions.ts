import { createAction, props } from '@ngrx/store';
import { Property, PropertyCreateRequest } from '../../models/property.model';

// Property Management
export const createProperty = createAction(
  '[Property] Create Property',
  props<{ propertyData: PropertyCreateRequest }>()
);

export const createPropertySuccess = createAction(
  '[Property] Create Property Success',
  props<{ property: Property; message: string }>()
);

export const createPropertyFailure = createAction(
  '[Property] Create Property Failure',
  props<{ error: string }>()
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

// Utility Actions
export const resetPropertySuccessStates = createAction('[Property] Reset Success States');
export const clearPropertyErrors = createAction('[Property] Clear Errors');
