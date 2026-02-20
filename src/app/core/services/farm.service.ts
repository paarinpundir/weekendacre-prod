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
  private mockFarms: Farm[] = [];

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
