import { createFeatureSelector, createSelector } from '@ngrx/store';
import { propertyAdapter, PropertyState } from './property.state';

// Get the property feature state
export const selectPropertyState = createFeatureSelector<PropertyState>('property');

// Create adapter selectors
const { selectAll, selectEntities, selectIds, selectTotal } = propertyAdapter.getSelectors();

// Get all properties using the adapter's selectAll selector
export const selectAllProperties = createSelector(
  selectPropertyState,
  selectAll
);

// Get property loading state
export const selectPropertyLoading = createSelector(
  selectPropertyState,
  (state: PropertyState) => state.loading
);

// Get property error state
export const selectPropertyError = createSelector(
  selectPropertyState,
  (state: PropertyState) => state.error
);

// Get created property
export const selectCreatedProperty = createSelector(
  selectPropertyState,
  (state: PropertyState) => state.createdProperty
);

