import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { BookingService, ProduceLine, SavedBooking } from '../../../core/services/booking.service';
import { Property, PropertyCrop, PropertyStayFacility } from '../../../core/models/property.model';
import { environment } from '../../../../environments/environment';

interface ProduceChoice {
  crop: PropertyCrop;
  qty: number;
  fulfilment: 'take_home' | 'deliver';
}

@Component({
  selector: 'app-stay-booking',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './stay-booking.html',
  styleUrl: './stay-booking.scss',
})
export class StayBooking implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly properties = inject(PropertyService);
  private readonly bookings = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);

  property: Property | null = null;
  saved: SavedBooking | null = null;
  produce: ProduceChoice[] = [];
  loading = true;
  saving = false;
  error: string | null = null;

  checkIn = '';
  checkOut = '';
  adults = 1;
  children = 0;
  infants = 0;
  pets = 0;
  stayFacilityId = '';
  guestName = '';
  guestEmail = '';
  guestPhone = '';
  notes = '';
  today = '';
  private rates: Record<string, number> = {};

  ngOnInit() {
    const now = new Date();
    this.today = this.iso(now);
    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (bookingId) {
      this.loadSaved(bookingId);
      return;
    }
    const propertyId = this.route.snapshot.paramMap.get('id');
    const query = this.route.snapshot.queryParamMap;
    this.checkIn = query.get('checkIn') || '';
    this.checkOut = query.get('checkOut') || '';
    this.adults = this.readCount(query.get('adults'), 1);
    this.children = this.readCount(query.get('children'), 0);
    this.infants = this.readCount(query.get('infants'), 0);
    this.pets = this.readCount(query.get('pets'), 0);
    this.stayFacilityId = query.get('room') || '';
    if (!propertyId) {
      this.fail('This farm could not be opened.');
      return;
    }
    const preset = query.get('crop') || '';
    this.properties.getProperty(propertyId).subscribe({
      next: (response) => {
        this.property = response?.data || null;
        this.produce = (this.property?.crops || []).map((crop) => ({
          crop,
          qty: preset && crop.crop_name === preset ? Math.max(crop.minimum_quantity_commitment || 1, 1) : 0,
          fulfilment: 'take_home' as const,
        }));
        this.loading = false;
        this.refreshRates();
        this.cdr.detectChanges();
      },
      error: () => this.fail('This farm is not open for booking.'),
    });
  }

  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const start = new Date(this.checkIn + 'T00:00:00');
    const end = new Date(this.checkOut + 'T00:00:00');
    const days = Math.round((end.getTime() - start.getTime()) / 86400000);
    return days > 0 ? days : 0;
  }

  get stayAmount(): number {
    if (this.nights < 1) return 0;
    const base = Number(this.property?.price_per_day) || 0;
    let total = 0;
    const cursor = new Date(this.checkIn + 'T00:00:00');
    const end = new Date(this.checkOut + 'T00:00:00');
    while (cursor < end) {
      const nightly = this.rates[this.iso(cursor)];
      total += nightly > 0 ? nightly : base;
      cursor.setDate(cursor.getDate() + 1);
    }
    return total;
  }

  refreshRates() {
    if (!this.property || this.nights < 1) {
      this.rates = {};
      return;
    }
    const lastNight = new Date(this.checkOut + 'T00:00:00');
    lastNight.setDate(lastNight.getDate() - 1);
    this.properties.getDailyRates(this.property.id, this.checkIn, this.iso(lastNight)).subscribe({
      next: (response) => {
        const next: Record<string, number> = {};
        for (const rate of response?.data || []) {
          const key = String(rate.date).slice(0, 10);
          if (rate.status && rate.status !== 'available') continue;
          next[key] = Number(rate.price) || 0;
        }
        this.rates = next;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rates = {};
        this.cdr.detectChanges();
      },
    });
  }

  get produceTotal(): number {
    return this.produce.reduce((sum, line) => sum + this.lineTotal(line), 0);
  }

  get total(): number {
    return this.stayAmount + this.produceTotal;
  }

  get selectedRoom(): PropertyStayFacility | undefined {
    return (this.property?.stay_facilities || []).find((room) => room.id === this.stayFacilityId);
  }

  get chosenProduce(): ProduceChoice[] {
    return this.produce.filter((line) => line.qty > 0);
  }

  lineTotal(line: ProduceChoice): number {
    return Math.round(line.qty * (Number(line.crop.current_selling_price) || 0));
  }

  bump(line: ProduceChoice, delta: number) {
    const min = line.qty === 0 && delta > 0 ? (line.crop.minimum_quantity_commitment || 1) : delta;
    const next = line.qty === 0 && delta > 0 ? min : line.qty + delta;
    line.qty = Math.max(0, Math.round(next * 10) / 10);
    if (line.qty > 0 && line.fulfilment === 'deliver' && !line.crop.can_deliver) {
      line.fulfilment = 'take_home';
    }
  }

  place(): string {
    const parts = (this.property?.address || this.saved?.address || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length >= 2) return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    return parts[0] || '';
  }

  photo(): string {
    const images = this.property?.images || [];
    const home = images.find((img) => img.image_type_code === 801 || img.is_primary) || images[0];
    const url = home?.image_url || '';
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${environment.apiUrl}${url}`;
    return `${environment.apiUrl}/${url}`;
  }

  money(amount: number): string {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }

  fulfilmentLabel(value: string): string {
    return value === 'deliver' ? 'Deliver' : 'Take home';
  }

  savedProduce(): ProduceLine[] {
    const raw = this.saved?.produce_items;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  submit() {
    if (!this.property || this.saving) return;
    if (!this.guestName.trim() || this.guestPhone.replace(/\D/g, '').length < 10) {
      this.error = 'Add your name and a 10-digit phone number.';
      return;
    }
    if (this.nights < 1) {
      this.error = 'Choose a check-in and a later check-out.';
      return;
    }
    for (const line of this.chosenProduce) {
      const min = line.crop.minimum_quantity_commitment || 0;
      if (min && line.qty < min) {
        this.error = `${line.crop.crop_name} starts at ${min} kg.`;
        return;
      }
    }
    this.saving = true;
    this.error = null;
    this.bookings.createStay({
      property_id: this.property.id,
      check_in: this.checkIn,
      check_out: this.checkOut,
      adults: this.adults,
      children: this.children,
      infants: this.infants,
      pets: this.pets,
      stay_facility_id: this.stayFacilityId,
      guest_name: this.guestName.trim(),
      guest_email: this.guestEmail.trim(),
      guest_phone: this.guestPhone.trim(),
      notes: this.notes.trim(),
      produce: this.chosenProduce.map((line) => ({
        crop_id: line.crop.id,
        quantity_kg: line.qty,
        fulfilment: line.fulfilment,
      })),
    }).subscribe({
      next: (response) => {
        const id = response?.data?.id;
        if (!id) {
          this.saving = false;
          this.error = 'The booking did not come back with a reference.';
          this.cdr.detectChanges();
          return;
        }
        this.router.navigate(['/bookings', id]);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.error || 'Could not save the booking.';
        this.cdr.detectChanges();
      },
    });
  }

  private loadSaved(id: string) {
    this.bookings.getStay(id).subscribe({
      next: (response) => {
        this.saved = response?.data || null;
        if (!this.saved) {
          this.fail('This booking could not be found.');
          return;
        }
        this.properties.getProperty(this.saved.property_id).subscribe({
          next: (property) => {
            this.property = property?.data || null;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => this.fail('This booking could not be found.'),
    });
  }

  private fail(message: string) {
    this.loading = false;
    this.error = message;
    this.cdr.detectChanges();
  }

  private readCount(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  }

  private iso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
