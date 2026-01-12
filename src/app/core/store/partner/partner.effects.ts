import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { PartnerService } from '../../services/partner.service';
import * as PartnerActions from './partner.actions';

@Injectable()
export class PartnerEffects {
  private actions$ = inject(Actions);
  private partnerService = inject(PartnerService);

  // Onboard Partner Effect
  onboardPartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.onboardPartner),
      mergeMap(({ partnerData }) =>
        this.partnerService.onboardPartner(partnerData).pipe(
          map((response: any) => 
            PartnerActions.onboardPartnerSuccess({
              partner: response.partner,
              message: response.message
            })
          ),
          catchError(error => 
            of(PartnerActions.onboardPartnerFailure({ 
              error: error.error?.message || 'Partner onboarding failed' 
            }))
          )
        )
      )
    )
  );

  // Load Partner Profile Effect
  loadPartnerProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.loadPartnerProfile),
      mergeMap(({ partnerId }) =>
        this.partnerService.getPartnerProfile(partnerId).pipe(
          map((partner: any) => 
            PartnerActions.loadPartnerProfileSuccess({ partner })
          ),
          catchError(error => 
            of(PartnerActions.loadPartnerProfileFailure({ 
              error: error.error?.message || 'Failed to load partner profile' 
            }))
          )
        )
      )
    )
  );

  // Update Partner Profile Effect
  updatePartnerProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.updatePartnerProfile),
      mergeMap(({ partnerId, updates }) =>
        this.partnerService.updatePartnerProfile(partnerId, updates).pipe(
          map((partner: any) => 
            PartnerActions.updatePartnerProfileSuccess({ partner })
          ),
          catchError(error => 
            of(PartnerActions.updatePartnerProfileFailure({ 
              error: error.error?.message || 'Failed to update partner profile' 
            }))
          )
        )
      )
    )
  );

  // Load Partners Effect (Admin)
  loadPartners$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.loadPartners),
      mergeMap(({ page, limit, status, businessType, search }) =>
        this.partnerService.listPartners({ page, limit, status, businessType, search }).pipe(
          map((response: any) => 
            PartnerActions.loadPartnersSuccess({
              partners: response.partners,
              total: response.total,
              page: response.page,
              limit: response.limit
            })
          ),
          catchError(error => 
            of(PartnerActions.loadPartnersFailure({ 
              error: error.error?.message || 'Failed to load partners' 
            }))
          )
        )
      )
    )
  );

  // Approve Partner Effect
  approvePartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.approvePartner),
      mergeMap(({ partnerId, approvedBy }) =>
        this.partnerService.approvePartner(partnerId, approvedBy).pipe(
          map((partner: any) => 
            PartnerActions.approvePartnerSuccess({ partner })
          ),
          catchError(error => 
            of(PartnerActions.approvePartnerFailure({ 
              error: error.error?.message || 'Failed to approve partner' 
            }))
          )
        )
      )
    )
  );

  // Reject Partner Effect
  rejectPartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.rejectPartner),
      mergeMap(({ partnerId, rejectionReason, rejectedBy }) =>
        this.partnerService.rejectPartner(partnerId, rejectionReason, rejectedBy).pipe(
          map((partner: any) => 
            PartnerActions.rejectPartnerSuccess({ partner })
          ),
          catchError(error => 
            of(PartnerActions.rejectPartnerFailure({ 
              error: error.error?.message || 'Failed to reject partner' 
            }))
          )
        )
      )
    )
  );

  // Suspend Partner Effect
  suspendPartner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.suspendPartner),
      mergeMap(({ partnerId, reason, suspendedBy }) =>
        this.partnerService.suspendPartner(partnerId, reason, suspendedBy).pipe(
          map((partner: any) => 
            PartnerActions.suspendPartnerSuccess({ partner })
          ),
          catchError(error => 
            of(PartnerActions.suspendPartnerFailure({ 
              error: error.error?.message || 'Failed to suspend partner' 
            }))
          )
        )
      )
    )
  );

  // Upload Documents Effect
  uploadPartnerDocuments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.uploadPartnerDocuments),
      mergeMap(({ partnerId, documents }) =>
        this.partnerService.uploadDocuments(partnerId, documents).pipe(
          map((documentUrls: any) => 
            PartnerActions.uploadPartnerDocumentsSuccess({ documents: documentUrls.urls })
          ),
          catchError(error => 
            of(PartnerActions.uploadPartnerDocumentsFailure({ 
              error: error.error?.message || 'Failed to upload documents' 
            }))
          )
        )
      )
    )
  );
}

