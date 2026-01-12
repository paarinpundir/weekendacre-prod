import { createReducer, on, Action } from '@ngrx/store';
import { authAdapter, initialAuthState, AuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export type { AuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state): AuthState => ({
    ...state,
    loginLoading: true,
    loginError: null,
    loading: true,
  })),
  
  on(AuthActions.loginSuccess, (state, { user, accessToken, refreshToken, expiresIn }): AuthState => {
    const expiryTime = Date.now() + (expiresIn * 1000);
    return authAdapter.setOne(user, {
      ...state,
      currentUser: user,
      isAuthenticated: true,
      accessToken,
      refreshToken,
      tokenExpiry: expiryTime,
      loginLoading: false,
      loading: false,
      loginError: null,
    });
  }),
  
  on(AuthActions.loginFailure, (state, { error }): AuthState => ({
    ...state,
    loginLoading: false,
    loading: false,
    loginError: error,
    currentUser: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
  })),

  // Registration
  on(AuthActions.register, (state): AuthState => ({
    ...state,
    registrationLoading: true,
    registrationError: null,
    loading: true,
  })),
  
  on(AuthActions.registerSuccess, (state, { user, accessToken, refreshToken }): AuthState => {
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    return authAdapter.setOne(user, {
      ...state,
      currentUser: user,
      isAuthenticated: true,
      accessToken,
      refreshToken,
      tokenExpiry: expiryTime,
      registrationLoading: false,
      loading: false,
      registrationError: null,
    });
  }),
  
  on(AuthActions.registerFailure, (state, { error }): AuthState => ({
    ...state,
    registrationLoading: false,
    loading: false,
    registrationError: error,
  })),

  // Logout
  on(AuthActions.logout, (state): AuthState => ({
    ...state,
    loading: true,
  })),
  
  on(AuthActions.logoutSuccess, (state): AuthState => 
    authAdapter.removeAll({
      ...state,
      currentUser: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      permissions: [],
      loading: false,
    })
  ),
  
  on(AuthActions.logoutFailure, (state, { error }): AuthState => ({
    ...state,
    loading: false,
    error,
  })),

  // Token Refresh
  on(AuthActions.refreshToken, (state): AuthState => ({
    ...state,
    loading: true,
  })),
  
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken, expiresIn }): AuthState => {
    const expiryTime = Date.now() + (expiresIn * 1000);
    return {
      ...state,
      accessToken,
      refreshToken,
      tokenExpiry: expiryTime,
      loading: false,
    };
  }),
  
  on(AuthActions.refreshTokenFailure, (state, { error }): AuthState => 
    authAdapter.removeAll({
      ...state,
      currentUser: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      permissions: [],
      loading: false,
      error,
    })
  ),

  // Load Current User
  on(AuthActions.loadCurrentUser, (state): AuthState => ({
    ...state,
    loading: true,
  })),
  
  on(AuthActions.loadCurrentUserSuccess, (state, { user, permissions }): AuthState => 
    authAdapter.setOne(user, {
      ...state,
      currentUser: user,
      isAuthenticated: true,
      permissions,
      loading: false,
    })
  ),
  
  on(AuthActions.loadCurrentUserFailure, (state, { error }): AuthState => ({
    ...state,
    loading: false,
    error,
    currentUser: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
    permissions: [],
  })),

  // Update User Profile
  on(AuthActions.updateUserProfile, (state): AuthState => ({
    ...state,
    loading: true,
  })),
  
  on(AuthActions.updateUserProfileSuccess, (state, { user }): AuthState => 
    authAdapter.updateOne(
      { id: user.id, changes: user },
      {
        ...state,
        currentUser: user,
        loading: false,
      }
    )
  ),
  
  on(AuthActions.updateUserProfileFailure, (state, { error }): AuthState => ({
    ...state,
    loading: false,
    error,
  })),

  // Password Reset
  on(AuthActions.forgotPassword, (state): AuthState => ({
    ...state,
    passwordResetLoading: true,
    passwordResetSuccess: false,
    passwordResetError: null,
  })),
  
  on(AuthActions.forgotPasswordSuccess, (state): AuthState => ({
    ...state,
    passwordResetLoading: false,
    passwordResetSuccess: true,
    passwordResetError: null,
  })),
  
  on(AuthActions.forgotPasswordFailure, (state, { error }): AuthState => ({
    ...state,
    passwordResetLoading: false,
    passwordResetSuccess: false,
    passwordResetError: error,
  })),

  on(AuthActions.resetPassword, (state): AuthState => ({
    ...state,
    passwordResetLoading: true,
    passwordResetSuccess: false,
    passwordResetError: null,
  })),
  
  on(AuthActions.resetPasswordSuccess, (state): AuthState => ({
    ...state,
    passwordResetLoading: false,
    passwordResetSuccess: true,
    passwordResetError: null,
  })),
  
  on(AuthActions.resetPasswordFailure, (state, { error }): AuthState => ({
    ...state,
    passwordResetLoading: false,
    passwordResetSuccess: false,
    passwordResetError: error,
  })),

  // Clear Errors
  on(AuthActions.clearAuthErrors, (state): AuthState => ({
    ...state,
    error: null,
    loginError: null,
    registrationError: null,
    passwordResetError: null,
  })),

  // Token Expired
  on(AuthActions.tokenExpired, (state): AuthState => 
    authAdapter.removeAll({
      ...state,
      currentUser: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      permissions: [],
      error: 'Session expired. Please login again.',
    })
  ),

  // Initialize Auth
  on(AuthActions.initializeAuth, (state): AuthState => ({
    ...state,
    loading: true,
  }))
);

export function reducer(state: AuthState | undefined, action: Action): AuthState {
  return authReducer(state, action);
}
