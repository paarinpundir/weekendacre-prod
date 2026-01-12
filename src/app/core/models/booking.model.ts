export interface Booking {
  id: string;
  userId: string;
  type: 'Day Visit' | 'Room Stay' | 'Activity';
  date: Date;
  endDate?: Date; // For room stays
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  activityId?: string; // For activity bookings
  participants?: number;
  roomType?: string;
  totalAmount: number;
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  type: 'Standard' | 'Deluxe' | 'Premium';
  capacity: number;
  price: number;
  amenities: string[];
  available: boolean;
}

