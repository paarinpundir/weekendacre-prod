import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; accessToken: string; refreshToken: string; expiresIn: number }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Registration Actions
export const register = createAction(
  '[Auth] Register',
  props<{ email: string; password: string; firstName: string; lastName: string; phone?: string; userType?: string }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; accessToken: string; refreshToken: string; message: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction('[Auth] Logout Failure', props<{ error: string }>());

// Token Management
export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ accessToken: string; refreshToken: string; expiresIn: number }>()
);
export const refreshTokenFailure = createAction('[Auth] Refresh Token Failure', props<{ error: string }>());

// Load Current User
export const loadCurrentUser = createAction('[Auth] Load Current User');
export const loadCurrentUserSuccess = createAction(
  '[Auth] Load Current User Success',
  props<{ user: User; permissions: string[] }>()
);
export const loadCurrentUserFailure = createAction('[Auth] Load Current User Failure', props<{ error: string }>());

// Update User Profile
export const updateUserProfile = createAction(
  '[Auth] Update User Profile',
  props<{ userId: string; updates: Partial<User> }>()
);
export const updateUserProfileSuccess = createAction(
  '[Auth] Update User Profile Success',
  props<{ user: User }>()
);
export const updateUserProfileFailure = createAction('[Auth] Update User Profile Failure', props<{ error: string }>());

// Password Reset
export const forgotPassword = createAction(
  '[Auth] Forgot Password',
  props<{ email: string }>()
);
export const forgotPasswordSuccess = createAction(
  '[Auth] Forgot Password Success',
  props<{ message: string }>()
);
export const forgotPasswordFailure = createAction('[Auth] Forgot Password Failure', props<{ error: string }>());

export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ token: string; newPassword: string }>()
);
export const resetPasswordSuccess = createAction(
  '[Auth] Reset Password Success',
  props<{ message: string }>()
);
export const resetPasswordFailure = createAction('[Auth] Reset Password Failure', props<{ error: string }>());

// Clear Errors
export const clearAuthErrors = createAction('[Auth] Clear Errors');

// Auto-logout on token expiry
export const tokenExpired = createAction('[Auth] Token Expired');

// Initialize auth from local storage
export const initializeAuth = createAction('[Auth] Initialize');
