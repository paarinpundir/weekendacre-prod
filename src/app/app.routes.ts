import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/home/home').then(m => m.Home)
  },
  {
    path: 'experiences/:slug',
    loadComponent: () =>
      import('./features/landing/experience-detail/experience-detail').then(m => m.ExperienceDetail),
  },
  {
    path: 'events/:slug',
    loadComponent: () =>
      import('./features/landing/event-detail/event-detail').then(m => m.EventDetail),
  },
  {
    path: 'virtual-tour',
    loadComponent: () => import('./features/virtual-tour/virtual-tour').then(m => m.OurFarm)
  },
  {
    path: 'activities',
    loadComponent: () => import('./features/activities/activities').then(m => m.Activities)
  },
  {
    path: 'education',
    loadComponent: () => import('./features/education/education').then(m => m.Education)
  },
  {
    path: 'booking',
    loadComponent: () => import('./features/booking/booking').then(m => m.BookingComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.Admin)
  },
  {
    path: 'farms',
    loadComponent: () => import('./features/farm/farm-listing/farm-listing').then(m => m.FarmListing)
  },
  {
    path: 'farms/:id',
    loadComponent: () => import('./features/farm/farm-detail/farm-detail').then(m => m.FarmDetail)
  },
  {
    path: 'partner/signup',
    loadComponent: () => import('./features/partner/partner-signup/partner-signup').then(m => m.PartnerSignup)
  },
  {
    path: 'partner/onboard',
    loadComponent: () => import('./features/partner/partner-onboarding/partner-onboarding').then(m => m.PartnerOnboarding)
  },
  {
    path: 'partner/onboarding/confirmation',
    loadComponent: () => import('./features/partner/onboarding-confirmation/onboarding-confirmation').then(m => m.OnboardingConfirmation)
  },
  {
    path: 'partner/dashboard',
    loadComponent: () => import('./features/partner/partner-dashboard/partner-dashboard').then(m => m.PartnerDashboard)
  },
  {
    path: 'property/onboard',
    loadComponent: () => import('./features/property/property-onboarding/property-onboarding').then(m => m.PropertyOnboarding)
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./features/property/property-detail/property-detail').then(m => m.PropertyDetail)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
