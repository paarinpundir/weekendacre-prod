import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { reducers } from './core/store';
import { AuthEffects } from './core/store/auth/auth.effects';
import { PartnerEffects } from './core/store/partner/partner.effects';
import { PropertyEffects } from './core/store/property/property.effects';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore(reducers),
    provideEffects([AuthEffects, PartnerEffects, PropertyEffects]),
    provideStoreDevtools({ 
      maxAge: 25, 
      logOnly: !isDevMode(),
      name: 'Eco Adventure Park Store'
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
