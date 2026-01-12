import { createReducer, on, Action } from '@ngrx/store';
import { partnerAdapter, initialPartnerState, PartnerState } from './partner.state';
import * as PartnerActions from './partner.actions';

export type { PartnerState } from './partner.state';

export const partnerReducer = createReducer(
  initialPartnerState,

  // Partner Onboarding
  on(PartnerActions.onboardPartner, (state): PartnerState => ({
    ...state,
    onboardingLoading: true,
    onboardingError: null,
    loading: true,
  })),
  
  on(PartnerActions.onboardPartnerSuccess, (state, { partner }): PartnerState => 
    partnerAdapter.setOne(partner, {
      ...state,
      currentPartner: partner,
      onboardingLoading: false,
      loading: false,
      onboardingSuccess: true,
      onboardingError: null,
    })
  ),
  
  on(PartnerActions.onboardPartnerFailure, (state, { error }): PartnerState => ({
    ...state,
    onboardingLoading: false,
    loading: false,
    onboardingError: error,
  })),

  // Load Partner Profile
  on(PartnerActions.loadPartnerProfile, (state): PartnerState => ({
    ...state,
    loading: true,
  })),
  
  on(PartnerActions.loadPartnerProfileSuccess, (state, { partner }): PartnerState => 
    partnerAdapter.setOne(partner, {
      ...state,
      currentPartner: partner,
      loading: false,
    })
  ),
  
  on(PartnerActions.loadPartnerProfileFailure, (state, { error }): PartnerState => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Partner Profile
  on(PartnerActions.updatePartnerProfile, (state): PartnerState => ({
    ...state,
    updateLoading: true,
    updateError: null,
  })),
  
  on(PartnerActions.updatePartnerProfileSuccess, (state, { partner }): PartnerState => 
    partnerAdapter.updateOne(
      { id: partner.id, changes: partner },
      {
        ...state,
        currentPartner: partner,
        updateLoading: false,
        updateSuccess: true,
        updateError: null,
      }
    )
  ),
  
  on(PartnerActions.updatePartnerProfileFailure, (state, { error }): PartnerState => ({
    ...state,
    updateLoading: false,
    updateError: error,
  })),

  // Load Partners (Admin)
  on(PartnerActions.loadPartners, (state): PartnerState => ({
    ...state,
    loading: true,
  })),
  
  on(PartnerActions.loadPartnersSuccess, (state, { partners, total, page, limit }): PartnerState => 
    partnerAdapter.setAll(partners, {
      ...state,
      partners,
      total,
      page,
      limit,
      loading: false,
    })
  ),
  
  on(PartnerActions.loadPartnersFailure, (state, { error }): PartnerState => ({
    ...state,
    loading: false,
    error,
  })),

  // Approve Partner
  on(PartnerActions.approvePartner, (state): PartnerState => ({
    ...state,
    loading: true,
  })),
  
  on(PartnerActions.approvePartnerSuccess, (state, { partner }): PartnerState => 
    partnerAdapter.updateOne(
      { id: partner.id, changes: partner },
      {
        ...state,
        loading: false,
      }
    )
  ),
  
  on(PartnerActions.approvePartnerFailure, (state, { error }): PartnerState => ({
    ...state,
    loading: false,
    error,
  })),

  // Reject Partner
  on(PartnerActions.rejectPartner, (state): PartnerState => ({
    ...state,
    loading: true,
  })),
  
  on(PartnerActions.rejectPartnerSuccess, (state, { partner }): PartnerState => 
    partnerAdapter.updateOne(
      { id: partner.id, changes: partner },
      {
        ...state,
        loading: false,
      }
    )
  ),
  
  on(PartnerActions.rejectPartnerFailure, (state, { error }): PartnerState => ({
    ...state,
    loading: false,
    error,
  })),

  // Suspend Partner
  on(PartnerActions.suspendPartner, (state): PartnerState => ({
    ...state,
    loading: true,
  })),
  
  on(PartnerActions.suspendPartnerSuccess, (state, { partner }): PartnerState => 
    partnerAdapter.updateOne(
      { id: partner.id, changes: partner },
      {
        ...state,
        loading: false,
      }
    )
  ),
  
  on(PartnerActions.suspendPartnerFailure, (state, { error }): PartnerState => ({
    ...state,
    loading: false,
    error,
  })),

  // Upload Documents
  on(PartnerActions.uploadPartnerDocuments, (state): PartnerState => ({
    ...state,
    loading: true,
  })),
  
  on(PartnerActions.uploadPartnerDocumentsSuccess, (state): PartnerState => ({
    ...state,
    loading: false,
  })),
  
  on(PartnerActions.uploadPartnerDocumentsFailure, (state, { error }): PartnerState => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear State and Errors
  on(PartnerActions.clearPartnerState, (state): PartnerState => 
    partnerAdapter.removeAll({
      ...initialPartnerState,
    })
  ),
  
  on(PartnerActions.clearPartnerErrors, (state): PartnerState => ({
    ...state,
    error: null,
    onboardingError: null,
    updateError: null,
  })),

  // Reset Success States
  on(PartnerActions.resetPartnerSuccessStates, (state): PartnerState => ({
    ...state,
    onboardingSuccess: false,
    updateSuccess: false,
  })),

  // Set Filters
  on(PartnerActions.setPartnerFilters, (state, { status, businessType, search }): PartnerState => ({
    ...state,
    status: status || state.status,
    businessType: businessType || state.businessType,
    search: search || state.search,
  }))
);

export function reducer(state: PartnerState | undefined, action: Action): PartnerState {
  return partnerReducer(state, action);
}
