export interface Partner {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  documents?: string[];
  metadata?: Record<string, any>;
}

export interface PartnerOnboardingData {
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  description?: string;
  documents?: File[];
}

export interface PartnerDocument {
  id: string;
  partnerId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface PartnerStats {
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: number[];
  occupancyRate: number;
}
