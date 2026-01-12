import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Property, Category, PropertyReview, PropertySearchRequest, PropertyAvailability, PropertyPricing } from '../../models/property.model';

export interface PropertyState extends EntityState<Property> {
  // Current property
  currentProperty: Property | null;
  createdProperty: Property | null;
  
  // Featured properties
  featuredProperties: Property[];
  
  // Search results
  searchResults: Property[];
  total: number;
  page: number;
  limit: number;
  suggestions: string[];
  
  // Categories
  categories: Category[];
  
  // Reviews
  propertyReviews: { [propertyId: string]: PropertyReview[] };
  
  // Loading states
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  searchLoading: boolean;
  categoriesLoading: boolean;
  availabilityLoading: boolean;
  pricingLoading: boolean;
  reviewsLoading: boolean;
  
  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  searchError: string | null;
  categoriesError: string | null;
  reviewsError: string | null;
  
  // Search filters
  filters: PropertySearchRequest;
  searchQuery: string;
  
  // Property availability and pricing
  availability: { [propertyId: string]: PropertyAvailability[] };
  pricing: { [propertyId: string]: PropertyPricing & { calculatedPrice?: number; breakdown?: any[] } };
  
  // Success states
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

export const propertyAdapter = createEntityAdapter<Property>({
  selectId: (property: Property) => property.id
});

export const initialPropertyState: PropertyState = propertyAdapter.getInitialState({
  currentProperty: null,
  createdProperty: null,
  featuredProperties: [],
  searchResults: [],
  total: 0,
  page: 1,
  limit: 10,
  suggestions: [],
  categories: [],
  propertyReviews: {},
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  searchLoading: false,
  categoriesLoading: false,
  availabilityLoading: false,
  pricingLoading: false,
  reviewsLoading: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,
  categoriesError: null,
  reviewsError: null,
  filters: {
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    minPrice: 0,
    maxPrice: 1000,
    amenities: [],
  },
  searchQuery: '',
  availability: {},
  pricing: {},
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
});
