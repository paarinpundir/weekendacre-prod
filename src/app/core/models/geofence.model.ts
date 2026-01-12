export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  area: GeoPoint[]; // Polygon coordinates
  center: GeoPoint;
  type: 'Activity' | 'Farm' | 'Education' | 'Accommodation' | 'General';
  description?: string;
}

export interface ParkArea {
  id: string;
  name: string;
  zones: GeofenceZone[];
  totalArea: number; // in square meters
}

