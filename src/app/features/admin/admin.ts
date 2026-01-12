import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { FarmService } from '../../core/services/farm.service';
import { Activity } from '../../core/models/activity.model';
import { Booking as BookingModel } from '../../core/models/booking.model';
import { Review } from '../../core/models/user.model';
import { Farm, SoilType } from '../../core/models/farm.model';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  activeTab: 'activities' | 'bookings' | 'reviews' | 'farms' | 'partners' = 'farms';
  
  get activities() {
    return this.dataService.getActivities()();
  }

  get bookings() {
    return this.dataService.getBookings()();
  }

  get reviews() {
    return this.dataService.getReviews()();
  }
  
  showActivityForm = false;
  newActivity: Partial<Activity> = {
    name: '',
    description: '',
    difficultyLevel: 'Easy',
    ageLimit: { min: 5 },
    price: 0,
    duration: 60,
    category: 'Adventure',
    imageUrl: '',
    available: true
  };

  farms: Farm[] = [];
  pendingFarms: Farm[] = [];
  submittedFarms: Farm[] = [];
  underReviewFarms: Farm[] = [];
  needsMoreInfoFarms: Farm[] = [];
  rejectedFarms: Farm[] = [];
  verifiedFarms: Farm[] = [];
  selectedFarm: Farm | null = null;
  reviewNotes = '';
  needsMoreInfoReason = '';

  getAmenitiesList(farm: Farm): string {
    if (!farm.amenities || farm.amenities.length === 0) {
      return 'Not specified';
    }
    return farm.amenities.map(a => a.name || a).join(', ');
  }

  getFarmImageUrl(farm: Farm): string {
    if (farm.images && farm.images.length > 0) {
      const firstImage = farm.images[0];
      return firstImage.imageUrl || '';
    }
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800';
  }

  getFarmDescription(farm: Farm): string {
    if (!farm.description) {
      return '';
    }
    return farm.description.length > 100 ? farm.description.substring(0, 100) + '...' : farm.description;
  }

  getProductionList(farm: Farm): string {
    if (!farm.production || farm.production.length === 0) {
      return 'Not specified';
    }
    return farm.production.join(', ');
  }

  soilTypes: { value: SoilType; label: string }[] = [
    { value: 'red', label: 'Red Soil' },
    { value: 'black', label: 'Black Soil' },
    { value: 'alluvial', label: 'Alluvial Soil' },
    { value: 'sandy', label: 'Sandy Soil' },
    { value: 'loam', label: 'Loam Soil' },
    { value: 'clay', label: 'Clay Soil' },
    { value: 'other', label: 'Other' }
  ];

  getSoilTypeLabel(soilType: string | undefined): string {
    if (!soilType) return 'Not specified';
    const soil = this.soilTypes.find(s => s.value === soilType);
    return soil?.label || soilType;
  }

  getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image?.imageUrl || image?.url || '';
  }
  
  partners: any[] = [
    { id: '999999', name: 'Eco Farm Partners', email: 'partner@ecofarm.com', status: 'verified', farmsCount: 6 },
    { id: '999998', name: 'Green Valley Co', email: 'green@valley.com', status: 'pending', farmsCount: 2 },
    { id: '999997', name: 'Organic Farms Ltd', email: 'organic@farms.com', status: 'verified', farmsCount: 4 }
  ];
  pendingPartners: any[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private farmService: FarmService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isUserAdmin()) {
      this.router.navigate(['/']);
    }
    this.loadFarms();
    this.loadPartners();
  }

  loadFarms() {
    this.farms = this.farmService.getFarms();
    this.pendingFarms = this.farms.filter(f => !f.isVerified && (!f.status || f.status === 'submitted'));
    this.submittedFarms = this.farms.filter(f => f.status === 'submitted');
    this.underReviewFarms = this.farms.filter(f => f.status === 'under_review');
    this.needsMoreInfoFarms = this.farms.filter(f => f.status === 'needs_more_info');
    this.rejectedFarms = this.farms.filter(f => f.status === 'rejected');
    this.verifiedFarms = this.farms.filter(f => f.status === 'verified' || f.isVerified);
  }

  loadPartners() {
    this.pendingPartners = this.partners.filter(p => p.status === 'pending');
  }

  viewFarmDetails(farm: Farm) {
    this.selectedFarm = farm;
  }

  closeFarmDetails() {
    this.selectedFarm = null;
    this.reviewNotes = '';
    this.needsMoreInfoReason = '';
  }

  approveFarm(farmId: string) {
    const farm = this.farms.find(f => f.id === farmId);
    if (farm) {
      farm.status = 'verified';
      farm.isVerified = true;
      farm.verifiedAt = new Date().toISOString();
      farm.verifiedBy = 'admin'; // In real app, use actual admin ID
      this.loadFarms();
      this.closeFarmDetails();
      alert('Farm verified successfully! It will now be visible to guests.');
    }
  }

  rejectFarm(farmId: string) {
    if (confirm('Are you sure you want to reject this farm?')) {
      const farm = this.farms.find(f => f.id === farmId);
      if (farm) {
        farm.status = 'rejected';
        farm.isActive = false;
        farm.rejectionReason = this.reviewNotes || 'Farm did not meet verification criteria.';
        this.loadFarms();
        this.closeFarmDetails();
        alert('Farm rejected. Partner will be notified.');
      }
    }
  }

  markNeedsMoreInfo(farmId: string) {
    if (!this.needsMoreInfoReason.trim()) {
      alert('Please provide a reason for requesting more information.');
      return;
    }
    const farm = this.farms.find(f => f.id === farmId);
    if (farm) {
      farm.status = 'needs_more_info';
      farm.needsMoreInfoReason = this.needsMoreInfoReason;
      this.loadFarms();
      this.closeFarmDetails();
      alert('Farm marked as "Needs More Info". Partner will be notified to update their submission.');
    }
  }

  startReview(farmId: string) {
    const farm = this.farms.find(f => f.id === farmId);
    if (farm) {
      farm.status = 'under_review';
      this.loadFarms();
    }
  }

  verifyPartner(partnerId: string) {
    const partner = this.partners.find(p => p.id === partnerId);
    if (partner) {
      partner.status = 'verified';
      this.loadPartners();
      alert('Partner verified successfully!');
    }
  }

  rejectPartner(partnerId: string) {
    if (confirm('Are you sure you want to reject this partner?')) {
      const partner = this.partners.find(p => p.id === partnerId);
      if (partner) {
        partner.status = 'rejected';
        this.loadPartners();
        alert('Partner rejected.');
      }
    }
  }

  addActivity() {
    if (!this.newActivity.name || !this.newActivity.description) {
      alert('Please fill in all required fields');
      return;
    }

    const activity: Activity = {
      id: `activity-${Date.now()}`,
      name: this.newActivity.name!,
      description: this.newActivity.description!,
      difficultyLevel: this.newActivity.difficultyLevel!,
      ageLimit: this.newActivity.ageLimit!,
      price: this.newActivity.price || 0,
      duration: this.newActivity.duration || 60,
      category: this.newActivity.category!,
      imageUrl: this.newActivity.imageUrl || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      available: this.newActivity.available ?? true
    };

    this.dataService.addActivity(activity);
    this.showActivityForm = false;
    this.resetActivityForm();
    alert('Activity added successfully!');
  }

  resetActivityForm() {
    this.newActivity = {
      name: '',
      description: '',
      difficultyLevel: 'Easy',
      ageLimit: { min: 5 },
      price: 0,
      duration: 60,
      category: 'Adventure',
      imageUrl: '',
      available: true
    };
  }

  deleteActivity(id: string) {
    if (confirm('Are you sure you want to delete this activity?')) {
      this.dataService.deleteActivity(id);
    }
  }

  updateBookingStatus(id: string, status: BookingModel['status']) {
    this.dataService.updateBooking(id, { status });
  }

  deleteReview(id: string) {
    // In a real app, this would be implemented in the service
    alert('Review deletion would be implemented here');
  }

  getStatusCount(status: string): number {
    return this.bookings.filter(b => b.status === status).length;
  }
}
