import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { User } from '../../models/user.model';

export interface AuthState extends EntityState<User> {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // JWT tokens
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  
  // User permissions
  permissions: string[];
  
  // Login status
  loginLoading: boolean;
  loginError: string | null;
  
  // Registration status
  registrationLoading: boolean;
  registrationError: string | null;
  
  // Password reset
  passwordResetLoading: boolean;
  passwordResetSuccess: boolean;
  passwordResetError: string | null;
}

export const authAdapter = createEntityAdapter<User>();

export const initialAuthState: AuthState = authAdapter.getInitialState({
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  permissions: [],
  loginLoading: false,
  loginError: null,
  registrationLoading: false,
  registrationError: null,
  passwordResetLoading: false,
  passwordResetSuccess: false,
  passwordResetError: null,
});
