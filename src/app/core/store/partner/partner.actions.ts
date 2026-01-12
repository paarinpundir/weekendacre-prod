import { createAction, props } from '@ngrx/store';
import { Partner, PartnerOnboardingData } from '../../models/partner.model';

// Partner Onboarding
export const onboardPartner = createAction(
  '[Partner] Onboard Partner',
  props<{ partnerData: PartnerOnboardingData }>()
);

export const onboardPartnerSuccess = createAction(
  '[Partner] Onboard Partner Success',
  props<{ partner: Partner; message: string }>()
);

export const onboardPartnerFailure = createAction(
  '[Partner] Onboard Partner Failure',
  props<{ error: string }>()
);

// Load Partner Profile
export const loadPartnerProfile = createAction(
  '[Partner] Load Partner Profile',
  props<{ partnerId: string }>()
);

export const loadPartnerProfileSuccess = createAction(
  '[Partner] Load Partner Profile Success',
  props<{ partner: Partner }>()
);

export const loadPartnerProfileFailure = createAction(
  '[Partner] Load Partner Profile Failure',
  props<{ error: string }>()
);

// Update Partner Profile
export const updatePartnerProfile = createAction(
  '[Partner] Update Partner Profile',
  props<{ partnerId: string; updates: Partial<Partner> }>()
);

export const updatePartnerProfileSuccess = createAction(
  '[Partner] Update Partner Profile Success',
  props<{ partner: Partner }>()
);

export const updatePartnerProfileFailure = createAction(
  '[Partner] Update Partner Profile Failure',
  props<{ error: string }>()
);

// Load Partners (Admin)
export const loadPartners = createAction(
  '[Partner] Load Partners',
  props<{ page?: number; limit?: number; status?: string; businessType?: string; search?: string }>()
);

export const loadPartnersSuccess = createAction(
  '[Partner] Load Partners Success',
  props<{ partners: Partner[]; total: number; page: number; limit: number }>()
);

export const loadPartnersFailure = createAction(
  '[Partner] Load Partners Failure',
  props<{ error: string }>()
);

// Approve Partner (Admin)
export const approvePartner = createAction(
  '[Partner] Approve Partner',
  props<{ partnerId: string; approvedBy: string }>()
);

export const approvePartnerSuccess = createAction(
  '[Partner] Approve Partner Success',
  props<{ partner: Partner }>()
);

export const approvePartnerFailure = createAction(
  '[Partner] Approve Partner Failure',
  props<{ error: string }>()
);

// Reject Partner (Admin)
export const rejectPartner = createAction(
  '[Partner] Reject Partner',
  props<{ partnerId: string; rejectionReason: string; rejectedBy: string }>()
);

export const rejectPartnerSuccess = createAction(
  '[Partner] Reject Partner Success',
  props<{ partner: Partner }>()
);

export const rejectPartnerFailure = createAction(
  '[Partner] Reject Partner Failure',
  props<{ error: string }>()
);

// Suspend Partner (Admin)
export const suspendPartner = createAction(
  '[Partner] Suspend Partner',
  props<{ partnerId: string; reason: string; suspendedBy: string }>()
);

export const suspendPartnerSuccess = createAction(
  '[Partner] Suspend Partner Success',
  props<{ partner: Partner }>()
);

export const suspendPartnerFailure = createAction(
  '[Partner] Suspend Partner Failure',
  props<{ error: string }>()
);

// Upload Partner Documents
export const uploadPartnerDocuments = createAction(
  '[Partner] Upload Documents',
  props<{ partnerId: string; documents: File[] }>()
);

export const uploadPartnerDocumentsSuccess = createAction(
  '[Partner] Upload Documents Success',
  props<{ documents: string[] }>()
);

export const uploadPartnerDocumentsFailure = createAction(
  '[Partner] Upload Documents Failure',
  props<{ error: string }>()
);

// Clear Partner State
export const clearPartnerState = createAction('[Partner] Clear State');
export const clearPartnerErrors = createAction('[Partner] Clear Errors');

// Set Partner Filters
export const setPartnerFilters = createAction(
  '[Partner] Set Filters',
  props<{ status?: string; businessType?: string; search?: string }>()
);

// Reset Partner Success States
export const resetPartnerSuccessStates = createAction('[Partner] Reset Success States');
