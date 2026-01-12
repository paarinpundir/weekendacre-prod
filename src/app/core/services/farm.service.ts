import { Injectable } from '@angular/core';
import { Farm, FarmZone, FarmImage, FarmAmenity, FarmStatus, SoilType } from '../models/farm.model';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  // Helper function to create FarmImage from URL
  private createImage(id: string, farmId: string, url: string, category: FarmImage['category'], isPrimary = false): FarmImage {
    return {
      id,
      farmId,
      imageUrl: url,
      fileName: `${category}.jpg`,
      fileSize: 500000,
      width: 1200,
      height: 800,
      category,
      isPrimary,
      uploadedAt: new Date().toISOString()
    };
  }

  // Helper function to create FarmAmenity
  private createAmenity(id: string, farmId: string, name: string): FarmAmenity {
    return { id, farmId, name };
  }

  // Mock data - hardcoded farms
  private mockFarms: Farm[] = [
    {
      id: '1',
      partnerId: '999999',
      name: 'Green Valley Eco Farm',
      description: 'A beautiful eco-friendly farm with sustainable practices. Experience organic farming, animal care, and adventure activities in a serene environment.',
      address: '123 Farm Road, Green Valley',
      district: 'Mumbai Suburban',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      latitude: 19.0760,
      longitude: 72.8777,
      soilType: 'alluvial' as SoilType,
      production: ['Rice', 'Wheat', 'Vegetables', 'Goats'],
      farmSize: 10,
      status: 'verified' as FarmStatus,
      isActive: true,
      isVerified: true,
      images: [
        this.createImage('1', '1', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800', 'hero', true),
        this.createImage('2', '1', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800', 'house_exterior'),
        this.createImage('3', '1', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'landscape')
      ],
      amenities: [
        this.createAmenity('1', '1', 'WiFi'),
        this.createAmenity('2', '1', 'Parking'),
        this.createAmenity('3', '1', 'Organic Food'),
        this.createAmenity('4', '1', 'Animal Care'),
        this.createAmenity('5', '1', 'Adventure Activities')
      ],
      zones: [
        {
          id: 'z1',
          farmId: '1',
          name: "Eco Area 1",
          description: 'Zone 1 of the eco-friendly area',
          zoneType: 'General',
          centerLat: 19.0765,
          centerLon: 72.8782,
          area: {},
          isActive: true
        }
      ],
      rating: 4.8,
      reviewCount: 127,
      pricePerDay: 2500,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      verifiedAt: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      partnerId: '999999',
      name: 'Sunrise Organic Farm',
      description: 'Experience the joy of organic farming and sustainable living. Perfect for families and educational groups.',
      address: '456 Organic Street',
      district: 'Pune',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '411001',
      latitude: 18.5204,
      longitude: 73.8567,
      soilType: 'black' as SoilType,
      production: ['Cotton', 'Sugarcane', 'Fruits'],
      farmSize: 8,
      status: 'verified' as FarmStatus,
      isActive: true,
      isVerified: true,
      images: [
        this.createImage('4', '2', 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800', 'hero', true),
        this.createImage('5', '2', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', 'house_exterior')
      ],
      amenities: [
        this.createAmenity('6', '2', 'WiFi'),
        this.createAmenity('7', '2', 'Parking'),
        this.createAmenity('8', '2', 'Organic Food'),
        this.createAmenity('9', '2', 'Hydroponics Lab')
      ],
      zones: [],
      rating: 4.6,
      reviewCount: 89,
      pricePerDay: 2000,
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-05T10:00:00Z',
      verifiedAt: '2024-02-05T10:00:00Z'
    },
    {
      id: '3',
      partnerId: '999999',
      name: 'Mountain View Adventure Farm',
      description: 'Thrilling adventure activities combined with farm education. Perfect for adventure enthusiasts.',
      address: '789 Adventure Lane',
      district: 'Nashik',
      city: 'Nashik',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '422001',
      latitude: 19.9975,
      longitude: 73.7898,
      soilType: 'red' as SoilType,
      production: ['Grapes', 'Pomegranate', 'Livestock'],
      farmSize: 15,
      status: 'verified' as FarmStatus,
      isActive: true,
      isVerified: true,
      images: [
        this.createImage('6', '3', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'hero', true),
        this.createImage('7', '3', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800', 'house_exterior')
      ],
      amenities: [
        this.createAmenity('10', '3', 'WiFi'),
        this.createAmenity('11', '3', 'Parking'),
        this.createAmenity('12', '3', 'Adventure Activities'),
        this.createAmenity('13', '3', 'Camping'),
        this.createAmenity('14', '3', 'BBQ')
      ],
      zones: [],
      rating: 4.9,
      reviewCount: 203,
      pricePerDay: 3500,
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      verifiedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '4',
      partnerId: '999999',
      name: 'Heritage Farm Experience',
      description: 'Traditional farming methods meet modern sustainability. Learn about heritage crops and traditional techniques.',
      address: '321 Heritage Road',
      district: 'Aurangabad',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '431001',
      latitude: 19.8762,
      longitude: 75.3433,
      soilType: 'loam' as SoilType,
      production: ['Heritage Crops', 'Traditional Vegetables'],
      farmSize: 12,
      status: 'verified' as FarmStatus,
      isActive: true,
      isVerified: true,
      images: [
        this.createImage('8', '4', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800', 'hero', true)
      ],
      amenities: [
        this.createAmenity('15', '4', 'WiFi'),
        this.createAmenity('16', '4', 'Parking'),
        this.createAmenity('17', '4', 'Traditional Food'),
        this.createAmenity('18', '4', 'Heritage Tours')
      ],
      zones: [],
      rating: 4.7,
      reviewCount: 156,
      pricePerDay: 1800,
      createdAt: '2024-02-10T10:00:00Z',
      updatedAt: '2024-02-12T10:00:00Z',
      verifiedAt: '2024-02-12T10:00:00Z'
    },
    {
      id: '5',
      partnerId: '999999',
      name: 'Coastal Eco Retreat',
      description: 'Farm experience by the coast. Enjoy fresh seafood, coastal farming, and beach activities.',
      address: '654 Coastal Highway',
      district: 'North Goa',
      city: 'Goa',
      state: 'Goa',
      country: 'India',
      zipCode: '403001',
      latitude: 15.2993,
      longitude: 74.1240,
      soilType: 'sandy' as SoilType,
      production: ['Coconuts', 'Cashews', 'Fish'],
      farmSize: 7,
      status: 'verified' as FarmStatus,
      isActive: true,
      isVerified: true,
      images: [
        this.createImage('9', '5', 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800', 'hero', true),
        this.createImage('10', '5', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', 'house_exterior')
      ],
      amenities: [
        this.createAmenity('19', '5', 'WiFi'),
        this.createAmenity('20', '5', 'Parking'),
        this.createAmenity('21', '5', 'Beach Access'),
        this.createAmenity('22', '5', 'Seafood'),
        this.createAmenity('23', '5', 'Water Sports')
      ],
      zones: [],
      rating: 4.5,
      reviewCount: 98,
      pricePerDay: 3000,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-25T10:00:00Z',
      verifiedAt: '2024-01-25T10:00:00Z'
    },
    {
      id: '6',
      partnerId: '999999',
      name: 'Urban Farm Oasis',
      description: 'Eco-farming in the heart of the city. Perfect for city dwellers to experience farming without leaving town.',
      address: '987 Urban Street',
      district: 'Mumbai Suburban',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400070',
      latitude: 19.1364,
      longitude: 72.8297,
      soilType: 'clay' as SoilType,
      production: ['Urban Vegetables', 'Herbs', 'Hydroponics'],
      farmSize: 2,
      status: 'verified' as FarmStatus,
      isActive: true,
      isVerified: true,
      images: [
        this.createImage('11', '6', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'hero', true)
      ],
      amenities: [
        this.createAmenity('24', '6', 'WiFi'),
        this.createAmenity('25', '6', 'Parking'),
        this.createAmenity('26', '6', 'Urban Farming'),
        this.createAmenity('27', '6', 'Workshops')
      ],
      zones: [],
      rating: 4.4,
      reviewCount: 67,
      pricePerDay: 1500,
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-18T10:00:00Z',
      verifiedAt: '2024-02-18T10:00:00Z'
    }
  ];

  getFarms(filters?: {
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Farm[] {
    let farms = [...this.mockFarms];

    if (filters) {
      if (filters.city) {
        farms = farms.filter(f => f.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }
      if (filters.state) {
        farms = farms.filter(f => f.state.toLowerCase().includes(filters.state!.toLowerCase()));
      }
      if (filters.minPrice) {
        farms = farms.filter(f => (f.pricePerDay || 0) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        farms = farms.filter(f => (f.pricePerDay || 0) <= filters.maxPrice!);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        farms = farms.filter(f =>
          f.name.toLowerCase().includes(searchLower) ||
          f.description.toLowerCase().includes(searchLower) ||
          f.city.toLowerCase().includes(searchLower)
        );
      }
    }

    return farms.filter(f => f.isActive && f.isVerified);
  }

  getFarmById(id: string): Farm | undefined {
    return this.mockFarms.find(f => f.id === id && f.isActive && f.isVerified);
  }

  getPartnerFarms(partnerId: string): Farm[] {
    return this.mockFarms.filter(f => f.partnerId === partnerId);
  }

  getFeaturedFarms(limit: number = 6): Farm[] {
    return this.mockFarms
      .filter(f => f.isActive && f.isVerified && f.rating && f.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  getPopularFarms(limit: number = 6): Farm[] {
    return this.mockFarms
      .filter(f => f.isActive && f.isVerified)
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, limit);
  }

  getRecentlyAddedFarms(limit: number = 6): Farm[] {
    return this.mockFarms
      .filter(f => f.isActive && f.isVerified)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
