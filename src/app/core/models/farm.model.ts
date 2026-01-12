import { Review } from './user.model';

export type FarmStatus = 'draft' | 'submitted' | 'under_review' | 'needs_more_info' | 'rejected' | 'verified';
export type SoilType = 'red' | 'black' | 'alluvial' | 'sandy' | 'loam' | 'clay' | 'other';

export interface Farm {
  id: string;
  partnerId: string;
  name: string;
  description: string; // 100-300 words
  address: string;
  village?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number; // Optional GPS coordinates
  longitude?: number; // Optional GPS coordinates
  soilType: SoilType;
  production: string[]; // Crops, fruits, vegetables, livestock
  farmSize: number; // in acres
  amenities: FarmAmenity[];
  images: FarmImage[];
  status: FarmStatus;
  isActive: boolean;
  isVerified: boolean;
  zones?: FarmZone[];
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  pricePerDay?: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  needsMoreInfoReason?: string;
}

export interface FarmZone {
  id: string;
  farmId: string;
  name: string;
  description: string;
  zoneType: 'Activity' | 'Farm' | 'Education' | 'Accommodation' | 'General';
  centerLat: number;
  centerLon: number;
  area: any; // JSON coordinates
  isActive: boolean;
}

export interface FarmImage {
  id: string;
  farmId: string;
  imageUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  width: number; // pixels
  height: number; // pixels
  category: 'hero' | 'house_exterior' | 'landscape' | 'room' | 'kitchen' | 'bathroom' | 'activity_space' | 'crops_livestock' | 'pond' | 'garden' | 'fields';
  isPrimary: boolean;
  uploadedAt: string;
}

export interface FarmAmenity {
  id: string;
  farmId: string;
  name: string;
  icon?: string;
}

export interface FarmOnboardingData {
  // Basic Info
  farmName: string;
  description: string; // 100-300 words
  address: string;
  village?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Farm Details
  soilType: SoilType;
  production: string[]; // Array of crops/fruits/vegetables/livestock
  farmSize: number; // acres
  
  // Amenities (checkboxes)
  hasPond: boolean;
  hasHouse: boolean;
  hasElectricity: boolean;
  hasWaterSource: boolean;
  hasParking: boolean;
  
  // Photos
  images: File[]; // 10 photos total
}

