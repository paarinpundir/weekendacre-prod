import { InjectionToken } from '@angular/core';
import { authReducer, AuthState } from './auth/auth.reducer';
import { createReducer, on, Action } from '@ngrx/store';
import * as AuthActions from './auth/auth.actions';
import * as PartnerActions from './partner/partner.actions';
import { partnerReducer, PartnerState } from './partner/partner.reducer';
import * as PropertyActions from './property/property.actions';
import { propertyReducer, PropertyState } from './property/property.reducer';

export interface AppState {
  auth: AuthState;
  partner: PartnerState;
  property: PropertyState;
}

export const reducers = {
  auth: authReducer,
  partner: partnerReducer,
  property: propertyReducer,
};

// Meta reducer for logging
export function debug(reducer: any): any {
  return function (state: any, action: any) {
    console.log('STATE', state);
    console.log('ACTION', action);
    return reducer(state, action);
  };
}

// Root reducer factory
export function createRootReducer(debugMode = false) {
  if (debugMode) {
    return {
      auth: debug(authReducer),
      partner: debug(partnerReducer),
      property: debug(propertyReducer),
    };
  }
  return reducers;
}

// Selectors
export const selectAuth = (state: AppState) => state.auth;
export const selectPartner = (state: AppState) => state.partner;
export const selectProperty = (state: AppState) => state.property;

// Auth Selectors
export const selectCurrentUser = (state: AppState) => state.auth.currentUser;
export const selectIsAuthenticated = (state: AppState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: AppState) => state.auth.loading;
export const selectAuthError = (state: AppState) => state.auth.error;
export const selectUserPermissions = (state: AppState) => state.auth.permissions;

// Partner Selectors
export const selectCurrentPartner = (state: AppState) => state.partner.currentPartner;
export const selectPartners = (state: AppState) => state.partner.entities;
export const selectPartnerLoading = (state: AppState) => state.partner.loading;
export const selectPartnerError = (state: AppState) => state.partner.error;

// Property Selectors
export const selectProperties = (state: AppState) => state.property.entities;
export const selectCurrentProperty = (state: AppState) => state.property.currentProperty;
export const selectFeaturedProperties = (state: AppState) => state.property.featuredProperties;
export const selectSearchResults = (state: AppState) => state.property.searchResults;
export const selectPropertyLoading = (state: AppState) => state.property.loading;
export const selectPropertyError = (state: AppState) => state.property.error;
export const selectPropertyFilters = (state: AppState) => state.property.filters;

// Role-based access helpers
export const isAdmin = (state: AppState) => state.auth.currentUser?.role === 'admin';
export const isPartner = (state: AppState) => state.auth.currentUser?.role === 'partner';
export const isGuest = (state: AppState) => state.auth.currentUser?.role === 'user' || !state.auth.currentUser?.role;

export const hasPermission = (state: AppState, permission: string) => 
  state.auth.permissions.includes(permission);

// Feature flags for different user types
export const showAdminFeatures = (state: AppState) => isAdmin(state);
export const showPartnerFeatures = (state: AppState) => isPartner(state);
export const showGuestFeatures = (state: AppState) => isGuest(state);

// Store token for dependency injection
export const ROOT_REDUCERS = new InjectionToken<any>('RootReducersToken', {
  factory: () => createRootReducer(),
});
