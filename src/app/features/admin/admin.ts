import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, tap, timeout } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { FarmService } from '../../core/services/farm.service';
import { PropertyService } from '../../core/services/property.service';
import { Activity } from '../../core/models/activity.model';
import { Booking as BookingModel } from '../../core/models/booking.model';
import { Review } from '../../core/models/user.model';
import { Farm, SoilType } from '../../core/models/farm.model';
import { Property } from '../../core/models/property.model';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  activeTab: 'activities' | 'bookings' | 'reviews' | 'farms' | 'properties' | 'partners' = 'properties';
  
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

  // Property management
  properties: Property[] = [];
  draftProperties: Property[] = []; // New
  pendingProperties: Property[] = [];
  submittedProperties: Property[] = [];
  underReviewProperties: Property[] = [];
  approvedProperties: Property[] = [];
  rejectedProperties: Property[] = [];
  selectedProperty: Property | null = null;
  isLoading = false;

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
  
  partners: any[] = []; // Removed dummy data
  pendingPartners: any[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private farmService: FarmService,
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isUserAdmin()) {
      this.router.navigate(['/']);
    }
    this.loadFarms();
    this.loadPartners();
    this.loadProperties();
  }

  loadFarms() {
    // ... existing code
  }

  loadPartners() {
    // Call backend API to fetch partners
    this.authService.getPartners().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.partners = response.data.map((user: any) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`.trim(),
            email: user.email,
            status: user.is_active ? 'verified' : 'pending', // Map active status to verified for now
            farmsCount: 0 // We'll need another API to get this or count properties locally
          }));
          this.pendingPartners = this.partners.filter(p => p.status === 'pending');
        }
      },
      error: (err) => {
        console.error('Failed to load partners:', err);
      }
    });
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

  // Property Management Methods
  loadProperties() {
    this.isLoading = true;

    const emptyResponse = { success: false as const, data: [] as Property[], message: '' };

    this.propertyService
      .getAllPropertiesForAdmin()
      .pipe(
        timeout(25000),
        catchError((err) => {
          console.warn('Admin properties endpoint failed, trying public list:', err);
          return this.propertyService.getAllProperties().pipe(
            timeout(25000),
            catchError((err2) => {
              console.error('Public properties fallback failed:', err2);
              return of(emptyResponse);
            })
          );
        }),
        tap((response) => {
          try {
            if (response?.success && Array.isArray(response.data)) {
              this.properties = response.data;
            } else {
              this.properties = [];
            }
            this.categorizeProperties();
          } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  categorizeProperties() {
    // State codes: 601=Draft, 602=Submitted, 603=Under Review, 604=Admin Approval, 605=Live, 606=Rejected
    this.draftProperties = this.properties.filter(p => p.state === 601);
    this.submittedProperties = this.properties.filter(p => p.state === 602);
    this.underReviewProperties = this.properties.filter(p => p.state === 603);
    this.approvedProperties = this.properties.filter(p => p.state === 604 || p.state === 605);
    this.rejectedProperties = this.properties.filter(p => p.state === 606);
    this.pendingProperties = [...this.submittedProperties, ...this.underReviewProperties];
  }

  viewPropertyDetails(property: Property) {
    this.selectedProperty = property;
    this.reviewNotes = '';
    this.needsMoreInfoReason = '';
  }

  closePropertyDetails() {
    this.selectedProperty = null;
    this.reviewNotes = '';
    this.needsMoreInfoReason = '';
  }

  approveProperty(propertyId: string) {
    if (!confirm('Are you sure you want to approve this property? It will become live and visible to users.')) {
      return;
    }

    // Set state to Live (605) - approved and active
    this.propertyService.updatePropertyState(propertyId, 605, 'Property approved by admin').subscribe({
      next: () => {
        alert('Property approved successfully! It is now live and visible to users.');
        this.loadProperties();
        this.closePropertyDetails();
      },
      error: (err) => {
        console.error('Failed to approve property:', err);
        alert('Failed to approve property. Please try again.');
      }
    });
  }

  rejectProperty(propertyId: string) {
    if (!confirm('Are you sure you want to reject this property?')) {
      return;
    }

    const reason = this.reviewNotes || 'Property did not meet verification criteria.';
    
    // Set state to Rejected (606)
    this.propertyService.updatePropertyState(propertyId, 606, reason).subscribe({
      next: () => {
        alert('Property rejected. Partner will be notified.');
        this.loadProperties();
        this.closePropertyDetails();
      },
      error: (err) => {
        console.error('Failed to reject property:', err);
        alert('Failed to reject property. Please try again.');
      }
    });
  }

  markPropertyNeedsMoreInfo(propertyId: string) {
    if (!this.needsMoreInfoReason.trim()) {
      alert('Please provide a reason for requesting more information.');
      return;
    }

    // Set state to Under Review (603) with reason
    this.propertyService.updatePropertyState(propertyId, 603, this.needsMoreInfoReason).subscribe({
      next: () => {
        alert('Property marked as "Needs More Info". Partner will be notified to update their submission.');
        this.loadProperties();
        this.closePropertyDetails();
      },
      error: (err) => {
        console.error('Failed to update property:', err);
        alert('Failed to update property. Please try again.');
      }
    });
  }

  startPropertyReview(propertyId: string) {
    // Set state to Under Review (603)
    this.propertyService.updatePropertyState(propertyId, 603, 'Admin started review').subscribe({
      next: () => {
        this.loadProperties();
      },
      error: (err) => {
        console.error('Failed to start review:', err);
        alert('Failed to start review. Please try again.');
      }
    });
  }

  getPropertyStateLabel(state: number): string {
    const stateLabels: { [key: number]: string } = {
      601: 'Draft',
      602: 'Submitted',
      603: 'Under Review',
      604: 'Approved',
      605: 'Live',
      606: 'Rejected',
      607: 'Suspended'
    };
    return stateLabels[state] || 'Unknown';
  }

  getPropertyStateBadgeClass(state: number): string {
    if (state === 605 || state === 604) return 'badge-verified';
    if (state === 602) return 'badge-submitted';
    if (state === 603) return 'badge-review';
    if (state === 606) return 'badge-rejected';
    return 'badge';
  }
}
