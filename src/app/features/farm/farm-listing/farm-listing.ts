import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { PropertyCard } from '../../property/property-card/property-card';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-farm-listing',
  imports: [CommonModule, FormsModule, RouterLink, PropertyCard],
  templateUrl: './farm-listing.html',
  styleUrl: './farm-listing.scss'
})
export class FarmListing implements OnInit, OnDestroy {
  private readonly propertyService = inject(PropertyService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly backendBaseUrl = environment.apiUrl;

  farms: Property[] = [];
  filteredFarms: Property[] = [];
  searchQuery = '';
  selectedCity = '';
  loading = false;
  error: string | null = null;

  cities: string[] = [];

  ngOnInit() {
    this.loadFarms();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFarms() {
    this.loading = true;
    this.error = null;

    this.propertyService.getAllProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.farms = Array.isArray(response?.data) ? response.data : [];
          this.filteredFarms = [...this.farms];
          this.extractLocations();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load live farms:', err);
          this.farms = [];
          this.filteredFarms = [];
          this.error = err.error?.error || err.error?.message || 'Failed to load live farms';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getImageUrl(property: Property): string {
    const images = property.images || [];
    if (images.length > 0) {
      const home = images.find((img: any) => img.image_type_code === 801 || img.is_primary) || images[0];
      const url = (home as any).image_url || (home as any).url || '';
      return this.resolveMediaUrl(url);
    }
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop';
  }

  private resolveMediaUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) return `${this.backendBaseUrl}${url}`;
    if (url.startsWith('uploads/')) return `${this.backendBaseUrl}/${url}`;
    return url;
  }

  extractLocations() {
    const citySet = new Set<string>();
    this.farms.forEach(farm => {
      const location = this.getCity(farm);
      if (location) citySet.add(location);
    });
    this.cities = Array.from(citySet).sort();
  }

  getCity(farm: Property): string {
    if (!farm.address) return '';
    const parts = farm.address.split(',').map(p => p.trim()).filter(Boolean);
    return parts[parts.length - 1] || farm.address;
  }

  applyFilters() {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredFarms = this.farms.filter(farm => {
      const matchesCity = !this.selectedCity || this.getCity(farm) === this.selectedCity;
      const haystack = [
        farm.property_name,
        farm.address,
        farm.short_description,
        farm.long_description,
        farm.property_code
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesCity && matchesSearch;
    });
  }

  onSearch() {
    this.applyFilters();
  }

  pickCity(city: string) {
    this.selectedCity = city;
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCity = '';
    this.applyFilters();
  }

  viewFarm(farmId: string) {
    this.router.navigate(['/properties', farmId]);
  }
}
