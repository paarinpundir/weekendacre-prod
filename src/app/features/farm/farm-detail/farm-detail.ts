import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FarmService } from '../../../core/services/farm.service';
import { Farm } from '../../../core/models/farm.model';
import { FarmImageGallery } from '../farm-image-gallery/farm-image-gallery';
import { FarmHeader } from '../farm-header/farm-header';
import { FarmAmenities } from '../farm-amenities/farm-amenities';
import { FarmReviews } from '../farm-reviews/farm-reviews';
import { FarmBookingWidget } from '../farm-booking-widget/farm-booking-widget';
import { FarmLocation } from '../farm-location/farm-location';

@Component({
  selector: 'app-farm-detail',
  imports: [
    CommonModule, 
    RouterLink,
    FarmImageGallery,
    FarmHeader,
    FarmAmenities,
    FarmReviews,
    FarmBookingWidget,
    FarmLocation
  ],
  templateUrl: './farm-detail.html',
  styleUrl: './farm-detail.scss'
})
export class FarmDetail implements OnInit {
  farm: Farm | null = null;
  loading = true;
  selectedImageIndex = 0;
  activeTab: 'photos' | 'amenities' | 'reviews' | 'location' = 'photos';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private farmService: FarmService
  ) {}

  ngOnInit() {
    const farmId = this.route.snapshot.paramMap.get('id');
    if (farmId) {
      this.loadFarm(farmId);
    } else {
      this.router.navigate(['/farms']);
    }
  }

  loadFarm(id: string) {
    this.loading = true;
    setTimeout(() => {
      const farm = this.farmService.getFarmById(id);
      this.farm = farm || null;
      if (!this.farm) {
        this.router.navigate(['/farms']);
        return;
      }
      this.loading = false;
    }, 500);
  }

  onImageSelected(index: number) {
    this.selectedImageIndex = index;
  }

  onBookNow() {
    this.router.navigate(['/booking'], { 
      queryParams: { 
        farmId: this.farm?.id,
        checkIn: (document.querySelector('[name="checkIn"]') as HTMLInputElement)?.value,
        checkOut: (document.querySelector('[name="checkOut"]') as HTMLInputElement)?.value,
        guests: (document.querySelector('[name="guests"]') as HTMLSelectElement)?.value
      } 
    });
  }

  setActiveTab(tab: 'photos' | 'amenities' | 'reviews' | 'location') {
    this.activeTab = tab;
  }
}
