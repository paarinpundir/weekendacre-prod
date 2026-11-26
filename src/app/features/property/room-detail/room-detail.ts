import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Property, PropertyStayFacility } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.scss',
})
export class RoomDetail implements OnInit, OnDestroy {
  property: Property | null = null;
  room: PropertyStayFacility | null = null;
  roomIndex = 0;
  loading = true;
  error: string | null = null;

  propertyId = '';
  private roomId = '';
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private readonly backendBaseUrl = environment.apiUrl;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('id') || '';
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    if (!this.propertyId || !this.roomId) {
      this.error = 'This room link is incomplete.';
      this.loading = false;
      return;
    }
    this.load();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  bathroomFacts(facility: PropertyStayFacility): { label: string; value: string }[] {
    const attached = facility.bathrooms_attached || 0;
    const shared = facility.bathrooms_shared || 0;
    const facts: { label: string; value: string }[] = [];
    if (attached) {
      facts.push({ label: 'Layout', value: attached === 1 ? '1 attached bathroom' : `${attached} attached bathrooms` });
    } else if (shared) {
      facts.push({ label: 'Layout', value: shared === 1 ? '1 shared bathroom' : `${shared} shared bathrooms` });
    }
    if (facility.bathroom_type) facts.push({ label: 'Toilet', value: facility.bathroom_type });
    if (facility.shower_type) facts.push({ label: 'Bathing', value: facility.shower_type });
    const water: string[] = [];
    if (facility.running_water !== false) water.push('Running water');
    if (facility.geyser) water.push('geyser');
    else if (facility.hot_water_available) water.push('hot water');
    if (water.length) facts.push({ label: 'Water', value: water.join(', ') });
    facts.push({ label: 'Towels', value: facility.towels_provided ? 'Provided in the room' : 'Bring your own' });
    facts.push({ label: 'Toiletries', value: facility.toiletries_provided ? 'Soap and essentials provided' : 'Bring your own soap' });
    if (facility.toilet_hygiene_rating) facts.push({ label: 'Toilet hygiene', value: `${facility.toilet_hygiene_rating} / 5` });
    return facts;
  }

  roomRatings(facility: PropertyStayFacility): { label: string; value: number }[] {
    const rows: [string, number | undefined][] = [
      ['Guest safety', facility.guest_safety_rating],
      ['Cleaning', facility.hygiene_cleaning_rating],
      ['Toilets', facility.toilet_hygiene_rating],
      ['Pathways', facility.pathway_safety_rating],
    ];
    return rows
      .filter((row): row is [string, number] => typeof row[1] === 'number' && row[1] > 0)
      .map(([label, value]) => ({ label, value }));
  }

  roomAmenities(facility: PropertyStayFacility): string[] {
    const raw = facility.amenities;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => typeof item === 'string' ? item : item?.amenity).filter((item): item is string => !!item);
  }

  roomPhoto(facility: PropertyStayFacility): string {
    const images = this.property?.images || [];
    const rooms = images.filter((img) => img.image_type_code === 809 || img.image_type === 'rooms');
    const pool = rooms.length ? rooms : images;
    const fallback = pool.length
      ? this.resolveMediaUrl(pool[this.roomIndex % pool.length].image_url)
      : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80&auto=format&fit=crop';
    return fallback;
  }

  clock(value: string | undefined): string {
    if (!value) return 'Flexible';
    const [h, m] = value.split(':').map(Number);
    if (Number.isNaN(h)) return 'Flexible';
    const suffix = h >= 12 ? 'pm' : 'am';
    return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, '0')} ${suffix}`;
  }

  private load() {
    const requireAuth = this.authService.isLoggedIn();
    this.propertyService.getProperty(this.propertyId, requireAuth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.apply(response.data || (response as unknown as Property)),
        error: () => {
          if (!requireAuth && this.authService.isLoggedIn()) {
            this.propertyService.getProperty(this.propertyId, true)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => this.apply(response.data),
                error: (err) => this.fail(err),
              });
            return;
          }
          this.propertyService.getProperty(this.propertyId, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => this.apply(response.data),
              error: (err) => this.fail(err),
            });
        },
      });
  }

  private apply(property: Property) {
    this.property = property;
    const facilities = property?.stay_facilities || [];
    const index = facilities.findIndex((facility) => facility.id === this.roomId);
    if (index < 0) {
      this.error = 'This room is no longer listed on the farm.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    this.roomIndex = index;
    this.room = facilities[index];
    this.loading = false;
    this.cdr.detectChanges();
  }

  private fail(err: { error?: { error?: string; message?: string }; message?: string }) {
    this.error = err.error?.error || err.error?.message || err.message || 'Failed to load this room.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  private resolveMediaUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) return `${this.backendBaseUrl}${url}`;
    return url;
  }
}
