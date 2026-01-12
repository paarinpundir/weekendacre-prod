import { Injectable, signal } from '@angular/core';
import { Activity, ActivityBooking } from '../models/activity.model';
import { Booking, Room } from '../models/booking.model';
import { GeofenceZone, GeoPoint, ParkArea } from '../models/geofence.model';
import { User, Review } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Sample data - in production, this would come from an API
  private activities = signal<Activity[]>([
    {
      id: '1',
      name: 'Tree Climbing Adventure',
      description: 'Climb through our obstacle course in the treetops',
      difficultyLevel: 'Medium',
      ageLimit: { min: 8, max: 60 },
      price: 500,
      duration: 60,
      category: 'Adventure',
      imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800',
      available: true
    },
    {
      id: '2',
      name: 'Organic Farming Workshop',
      description: 'Learn sustainable farming techniques',
      difficultyLevel: 'Easy',
      ageLimit: { min: 12 },
      price: 300,
      duration: 120,
      category: 'Farming',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
      available: true
    },
    {
      id: '3',
      name: 'Animal Care Experience',
      description: 'Interact with farm animals and learn about their care',
      difficultyLevel: 'Easy',
      ageLimit: { min: 5 },
      price: 250,
      duration: 90,
      category: 'Animal Care',
      imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
      available: true
    },
    {
      id: '4',
      name: 'Hydroponics Lab Tour',
      description: 'Explore our modern hydroponics facility',
      difficultyLevel: 'Easy',
      ageLimit: { min: 10 },
      price: 200,
      duration: 45,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
      available: true
    }
  ]);

  private bookings = signal<Booking[]>([]);
  private rooms = signal<Room[]>([
    {
      id: '1',
      name: 'Eco Cabin Standard',
      type: 'Standard',
      capacity: 2,
      price: 1500,
      amenities: ['WiFi', 'AC', 'Private Bathroom'],
      available: true
    },
    {
      id: '2',
      name: 'Eco Cabin Deluxe',
      type: 'Deluxe',
      capacity: 4,
      price: 2500,
      amenities: ['WiFi', 'AC', 'Private Bathroom', 'Balcony', 'Kitchenette'],
      available: true
    },
    {
      id: '3',
      name: 'Eco Cabin Premium',
      type: 'Premium',
      capacity: 6,
      price: 4000,
      amenities: ['WiFi', 'AC', 'Private Bathroom', 'Balcony', 'Full Kitchen', 'Living Room'],
      available: true
    }
  ]);

  private parkAreas = signal<ParkArea[]>([]);
  private reviews = signal<Review[]>([]);

  // Getters
  getActivities() {
    return this.activities.asReadonly();
  }

  getBookings() {
    return this.bookings.asReadonly();
  }

  getRooms() {
    return this.rooms.asReadonly();
  }

  getParkAreas() {
    return this.parkAreas.asReadonly();
  }

  getReviews() {
    return this.reviews.asReadonly();
  }

  // Methods
  addBooking(booking: Booking) {
    this.bookings.update(bookings => [...bookings, booking]);
  }

  updateBooking(id: string, updates: Partial<Booking>) {
    this.bookings.update(bookings =>
      bookings.map(b => b.id === id ? { ...b, ...updates } : b)
    );
  }

  deleteBooking(id: string) {
    this.bookings.update(bookings => bookings.filter(b => b.id !== id));
  }

  addActivity(activity: Activity) {
    this.activities.update(activities => [...activities, activity]);
  }

  updateActivity(id: string, updates: Partial<Activity>) {
    this.activities.update(activities =>
      activities.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  }

  deleteActivity(id: string) {
    this.activities.update(activities => activities.filter(a => a.id !== id));
  }

  addReview(review: Review) {
    this.reviews.update(reviews => [...reviews, review]);
  }

  // Geofencing methods - will be populated when lat/long are added
  initializeParkAreas(centerPoint: GeoPoint, totalArea: number, divisions: number) {
    // This will divide the area into equal parts
    // For now, creating placeholder structure
    const areas: ParkArea[] = [];
    const areaPerDivision = totalArea / divisions;
    
    for (let i = 0; i < divisions; i++) {
      areas.push({
        id: `area-${i + 1}`,
        name: `Zone ${i + 1}`,
        zones: [],
        totalArea: areaPerDivision
      });
    }
    
    this.parkAreas.set(areas);
  }

  addGeofenceZone(areaId: string, zone: GeofenceZone) {
    this.parkAreas.update(areas =>
      areas.map(area =>
        area.id === areaId
          ? { ...area, zones: [...area.zones, zone] }
          : area
      )
    );
  }
}

