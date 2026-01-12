# Codebase Structure - Production Grade Organization

## 📁 Directory Structure

```
src/app/
├── core/                          # Core application logic (singletons, shared)
│   ├── models/                    # TypeScript interfaces & types
│   │   ├── activity.model.ts
│   │   ├── booking.model.ts
│   │   ├── farm.model.ts
│   │   ├── geofence.model.ts
│   │   ├── partner.model.ts
│   │   ├── property.model.ts
│   │   ├── user.model.ts
│   │   └── index.ts              # Barrel export
│   ├── services/                   # Business logic services
│   │   ├── auth.service.ts
│   │   ├── data.service.ts
│   │   ├── farm.service.ts
│   │   ├── geofence.service.ts
│   │   ├── local-storage.service.ts
│   │   ├── partner.service.ts
│   │   ├── property.service.ts
│   │   └── index.ts              # Barrel export
│   ├── interceptors/              # HTTP interceptors
│   │   └── auth.interceptor.ts
│   └── store/                     # NgRx state management
│       ├── auth/
│       ├── partner/
│       ├── property/
│       └── index.ts
│
├── features/                      # Feature modules (lazy-loaded)
│   ├── landing/                   # Landing page components
│   │   ├── home/
│   │   ├── dual-carousel/
│   │   ├── experience-cards/
│   │   ├── membership-section/
│   │   ├── attractions-section/
│   │   ├── events-section/
│   │   ├── membership-registration/
│   │   └── contact-section/
│   │
│   ├── farm/                      # Farm-related features
│   │   ├── farm-listing/
│   │   ├── farm-detail/
│   │   ├── farm-image-gallery/
│   │   ├── farm-header/
│   │   ├── farm-amenities/
│   │   ├── farm-booking-widget/
│   │   ├── farm-reviews/
│   │   └── farm-location/
│   │
│   ├── partner/                   # Partner onboarding features
│   │   ├── partner-signup/
│   │   ├── partner-onboarding/
│   │   └── onboarding-confirmation/
│   │
│   ├── admin/                     # Admin panel
│   │   └── admin/
│   │
│   ├── dashboard/                 # User dashboard
│   │   └── dashboard/
│   │
│   ├── activities/                # Activities page
│   ├── booking/                   # Booking system
│   ├── education/                 # Education section
│   └── virtual-tour/              # Virtual tour
│
├── shared/                        # Shared/reusable components
│   ├── header/
│   ├── footer/
│   └── farm-card/
│
├── app.config.ts                  # Application configuration
├── app.routes.ts                   # Route definitions
├── app.ts                          # Root component
└── app.html                        # Root template
```

## 🎯 Organization Principles

### 1. **Feature-Based Structure**
- Each feature is self-contained in its own directory
- Features can be easily extracted into separate modules
- Clear separation of concerns

### 2. **Core Directory**
- Contains singleton services, models, and shared utilities
- Used across multiple features
- Barrel exports for clean imports

### 3. **Shared Components**
- Reusable UI components used across features
- Header, Footer, Cards, etc.

### 4. **Lazy Loading**
- All routes use lazy loading for better performance
- Each feature can be code-split independently

## 📦 Import Patterns

### Core Imports
```typescript
// Models
import { Farm, User } from '../../core/models';

// Services
import { FarmService, AuthService } from '../../core/services';

// Store
import { selectFarms } from '../../core/store';
```

### Feature Imports
```typescript
// Within same feature
import { FarmHeader } from '../farm-header/farm-header';

// Cross-feature (when needed)
import { FarmCard } from '../../../shared/farm-card/farm-card';
```

## 🎨 Theme System

Centralized theme in `src/styles/_theme.scss`:
- CSS Variables for colors, spacing, typography
- Consistent design tokens
- Easy theme customization

## ✅ Benefits

1. **Scalability**: Easy to add new features
2. **Maintainability**: Clear structure, easy to find code
3. **Performance**: Lazy loading, code splitting
4. **Testability**: Isolated features, easy to test
5. **Team Collaboration**: Clear ownership boundaries
6. **Production Ready**: Follows Angular best practices

