import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Partner } from '../../models/partner.model';

export interface PartnerState extends EntityState<Partner> {
  // Partner data
  currentPartner: Partner | null;
  partners: Partner[];
  
  // Loading states
  loading: boolean;
  onboardingLoading: boolean;
  updateLoading: boolean;
  
  // Error states
  error: string | null;
  onboardingError: string | null;
  updateError: string | null;
  
  // Success states
  onboardingSuccess: boolean;
  updateSuccess: boolean;
  
  // Pagination
  total: number;
  page: number;
  limit: number;
  
  // Filters
  status: string;
  businessType: string;
  search: string;
}

export const partnerAdapter = createEntityAdapter<Partner>();

export const initialPartnerState: PartnerState = partnerAdapter.getInitialState({
  currentPartner: null,
  partners: [],
  loading: false,
  onboardingLoading: false,
  updateLoading: false,
  error: null,
  onboardingError: null,
  updateError: null,
  onboardingSuccess: false,
  updateSuccess: false,
  total: 0,
  page: 1,
  limit: 10,
  status: '',
  businessType: '',
  search: '',
});
