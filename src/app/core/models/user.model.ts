export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'partner';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;
  profilePicture?: string;
  bio?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  bookingReminders: boolean;
  priceAlerts: boolean;
  newsletter: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowRecommendations: boolean;
  dataSharing: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
  type: 'Activity' | 'Overall' | 'Accommodation';
}

