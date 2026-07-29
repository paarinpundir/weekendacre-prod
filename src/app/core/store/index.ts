import { InjectionToken } from '@angular/core';
import { authReducer, AuthState } from './auth/auth.reducer';
import { createReducer, on, Action } from '@ngrx/store';
import * as AuthActions from './auth/auth.actions';
import * as PropertyActions from './property/property.actions';
import { propertyReducer, PropertyState } from './property/property.reducer';

export interface AppState {
  auth: AuthState;
  property: PropertyState;
}

export const reducers = {
  auth: authReducer,
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
      property: debug(propertyReducer),
    };
  }
  return reducers;
}

// Selectors
export const selectAuth = (state: AppState) => state.auth;
export const selectProperty = (state: AppState) => state.property;

// Auth Selectors
export const selectCurrentUser = (state: AppState) => state.auth.currentUser;
export const selectIsAuthenticated = (state: AppState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: AppState) => state.auth.loading;
export const selectAuthError = (state: AppState) => state.auth.error;
export const selectUserPermissions = (state: AppState) => state.auth.permissions;

// Property Selectors
export const selectProperties = (state: AppState) => state.property.entities;
export const selectPropertyLoading = (state: AppState) => state.property.loading;
export const selectPropertyError = (state: AppState) => state.property.error;

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
