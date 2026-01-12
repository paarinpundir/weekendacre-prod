import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FarmService } from '../../../core/services/farm.service';
import { Farm } from '../../../core/models/farm.model';

@Component({
  selector: 'app-farm-listing',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './farm-listing.html',
  styleUrl: './farm-listing.scss'
})
export class FarmListing implements OnInit {
  farms: Farm[] = [];
  filteredFarms: Farm[] = [];
  searchQuery = '';
  selectedCity = '';
  selectedState = '';
  minPrice = 0;
  maxPrice = 5000;
  showFilters = false;
  loading = false;

  cities: string[] = [];
  states: string[] = [];

  constructor(
    private farmService: FarmService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFarms();
  }

  loadFarms() {
    this.loading = true;
    setTimeout(() => {
      this.farms = this.farmService.getFarms();
      this.filteredFarms = [...this.farms];
      this.extractLocations();
      this.loading = false;
    }, 500);
  }

  getImageUrl(image: any): string {
    if (!image) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (typeof image === 'string') return image;
    return image.imageUrl || image.url || '';
  }

  extractLocations() {
    const citySet = new Set<string>();
    const stateSet = new Set<string>();
    this.farms.forEach(farm => {
      citySet.add(farm.city);
      stateSet.add(farm.state);
    });
    this.cities = Array.from(citySet).sort();
    this.states = Array.from(stateSet).sort();
  }

  applyFilters() {
    this.filteredFarms = this.farmService.getFarms({
      city: this.selectedCity || undefined,
      state: this.selectedState || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      search: this.searchQuery || undefined
    });
  }

  onSearch() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCity = '';
    this.selectedState = '';
    this.minPrice = 0;
    this.maxPrice = 5000;
    this.applyFilters();
  }

  viewFarm(farmId: string) {
    this.router.navigate(['/farms', farmId]);
  }
}

