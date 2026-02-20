// Property models matching backend API structure

export interface Property {
  id: string;
  owner_id: string;
  property_code?: string; // Memorable identifier like PROP-000001
  property_name: string;
  owner_name?: string;
  contact_person?: string;
  phone_number?: string;
  whatsapp_number?: string;
  email_id?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  total_land_area: number; // in acres
  land_area_unit?: string; // acres, hectares, bigha
  years_in_operation?: number;
  ownership_type?: string; // owned, leased, rented
  proof_of_ownership?: string;
  gst_number?: string;
  pan_number?: string;
  aadhar_number?: string;
  short_description?: string;
  long_description?: string;
  water_availability_issues?: string;
  labour_shortage?: boolean;
  pest_disease?: string;
  additional_notes?: string;
  unique_features?: string;
  concerns?: string;
  previous_partnership?: string;
  farm_owner_suggestions?: string;
  farm_type_code?: number; // Reference to 900 series
  full_time_staff_count?: number;
  part_time_staff_count?: number;
  hospitality_trained_staff?: number;
  english_speaking_guide?: boolean;
  cooking_staff_available?: boolean;
  crop_rotation_system: boolean;
  is_soil_tested: boolean;
  farm_boundary: boolean;
  parking_space_available: boolean;
  shelter_shade_area: boolean;
  cold_storage: boolean;
  storage_room: boolean;
  kitchen_facility: boolean;
  toilet_available: boolean;
  toilet_drinking_water: boolean;
  electricity_connection: boolean;
  backup_power: boolean;
  waste_management_system: boolean;
  state: number; // Reference to 600 series (property states)
  onboarding_step?: number; // Current step in onboarding
  onboarding_data?: any; // Store form data during onboarding
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relations (optional, loaded separately)
  water_sources?: PropertyWaterSource[];
  irrigation_systems?: PropertyIrrigationSystem[];
  pest_management?: PropertyPestManagement[];
  safety_equipment?: PropertySafetyEquipment[];
  infrastructure?: PropertyInfrastructure[];
  documents?: PropertyDocument[];
  images?: PropertyImage[];
  rates?: PropertyRate[];
  state_logs?: PropertyStateLog[];
  staff?: PropertyStaff[];
  crops?: PropertyCrop[];
  stay_facilities?: PropertyStayFacility[];
  experiences?: PropertyExperience[] | { [key: string]: boolean }; // Can be array or object from onboarding_data
  pricing_contracts?: PropertyPricingContract[];
}

export interface PropertyWaterSource {
  id: string;
  property_id: string;
  source_code: number; // Reference to 100 series
  created_at: string;
}

export interface PropertyIrrigationSystem {
  id: string;
  property_id: string;
  system_code: number; // Reference to 200 series
  created_at: string;
}

export interface PropertyPestManagement {
  id: string;
  property_id: string;
  method_code: number; // Reference to 300 series
  created_at: string;
}

export interface PropertySafetyEquipment {
  id: string;
  property_id: string;
  equipment_code: number; // Reference to 400 series
  created_at: string;
}

export interface PropertyInfrastructure {
  id: string;
  property_id: string;
  room_type: string;
  name: string;
  description?: string;
  capacity?: number;
  photos?: string[];
  amenities?: string[];
  constraints?: string[];
  limitations?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  document_type_code: number; // Reference to 500 series
  document_url: string;
  created_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_type: string; // home_page, detail_page, room_specific, other
  image_type_code?: number; // Reference to 800 series
  image_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
  room_id?: string; // If room-specific
  created_at: string;
}

export interface PropertyRate {
  id: string;
  property_id: string;
  date: string;
  rate: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyStateLog {
  id: string;
  property_id: string;
  from_state?: number;
  to_state: number;
  changed_by: string;
  reason?: string;
  created_at: string;
}

export interface PropertyStaff {
  id: string;
  property_id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyCrop {
  id: string;
  property_id: string;
  crop_name: string;
  area_under_cultivation?: number;
  expected_monthly_quantity?: number;
  seasonal_availability?: string;
  current_selling_price?: number;
  minimum_quantity_commitment?: number;
  packing_reference?: string;
  can_deliver?: boolean;
  delivery_centre?: string;
  pickup_point?: string;
  preferred_delivery_days?: string;
  vehicle_type?: string;
  packing_material?: string;
  distance_from_ncr?: number;
  time_to_deliver_hours?: number;
  organic_inputs?: PropertyOrganicInput[];
  created_at: string;
  updated_at: string;
}

export interface PropertyOrganicInput {
  id: string;
  property_id: string;
  crop_id?: string;
  input_code: number; // Reference to 1000 series
  created_at: string;
}

export interface PropertyStayFacility {
  id: string;
  property_id: string;
  room_type: string;
  number_of_rooms: number;
  bathrooms_attached?: number;
  bathrooms_shared?: number;
  hot_water_available?: boolean;
  max_guest_capacity?: number;
  check_in_time?: string;
  check_out_time?: string;
  guest_safety_rating?: number; // 1-5
  hygiene_cleaning_rating?: number; // 1-5
  toilet_hygiene_rating?: number; // 1-5
  pathway_safety_rating?: number; // 1-5
  animal_safety_measures?: string;
  emergency_plans?: string;
  first_aid_kit_available?: boolean;
  cctv_available?: boolean;
  photos?: string[];
  amenities?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyExperience {
  id: string;
  property_id: string;
  experience_type: string;
  name: string;
  description?: string;
  duration_hours?: number;
  max_participants?: number;
  price_per_person?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyPricingContract {
  id: string;
  property_id: string;
  minimum_monthly_agreement?: boolean;
  agreement_duration_months?: number;
  payment_preference?: string; // upi, bank_transfer, cash, other
  payment_terms?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Request/Response types
export interface PropertyCreateRequest {
  property_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  total_land_area: number;
  years_in_operation?: number;
  ownership_type?: string;
  proof_of_ownership?: string;
  gst_number?: string;
  pan_number?: string;
  aadhar_number?: string;
  crop_rotation_system?: boolean;
  is_soil_tested?: boolean;
  farm_boundary?: boolean;
  parking_space_available?: boolean;
  shelter_shade_area?: boolean;
  cold_storage?: boolean;
  storage_room?: boolean;
  kitchen_facility?: boolean;
  toilet_available?: boolean;
  toilet_drinking_water?: boolean;
  electricity_connection?: boolean;
  backup_power?: boolean;
  waste_management_system?: boolean;
  force_new?: boolean; // Flag to force create new property instead of returning existing draft
}

export interface PropertyUpdateStateRequest {
  state: number;
  reason?: string;
}

export interface AddWaterSourceRequest {
  source_code: number;
}

export interface AddIrrigationSystemRequest {
  system_code: number;
}

export interface AddPestManagementRequest {
  method_code: number;
}

export interface AddSafetyEquipmentRequest {
  equipment_code: number;
}

// Legacy types for backward compatibility (if needed)
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface PropertyAvailability {
  id: string;
  propertyId: string;
  date: string;
  available: boolean;
  availableSlots: number;
  totalSlots: number;
  price: number;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyPricing {
  id: string;
  propertyId: string;
  pricingType: 'per_night' | 'per_person' | 'per_hour' | 'flat_rate';
  basePrice: number;
  weekendPrice?: number;
  holidayPrice?: number;
  currency: string;
  minStayNights: number;
  maxStayNights?: number;
  depositAmount?: number;
  cleaningFee?: number;
  taxRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  userId: string;
  bookingId?: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  response?: string;
  responseDate?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertySearchRequest {
  query?: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  categories?: string[];
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  suggestions?: string[];
  page: number;
  limit: number;
}

// Legacy PropertyCreateRequest (kept for backward compatibility with old components)
export interface LegacyPropertyCreateRequest {
  partnerId: string;
  title: string;
  description: string;
  categoryId: string;
  propertyType: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  maxCapacity: number;
  minCapacity: number;
  sizeSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  features: string[];
  rules: string[];
  timezone: string;
}

export interface PropertyStats {
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  occupancyRate: number;
  monthlyViews: number[];
  monthlyRevenue: number[];
  topReviewers: {
    userId: string;
    userName: string;
    rating: number;
    reviewCount: number;
  }[];
}
