import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../../core/models/property.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-property-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './property-card.html',
  styleUrl: './property-card.scss'
})
export class PropertyCard {
  @Input() property!: Property;
  private readonly backendBaseUrl = environment.apiUrl;

  private resolveMediaUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) return `${this.backendBaseUrl}${url}`;
    if (url.startsWith('uploads/')) return `${this.backendBaseUrl}/${url}`;
    return url;
  }

  getPropertyImage(): string {
    if (this.property?.images && this.property.images.length > 0) {
      const homeImage = this.property.images.find((img: any) => img.image_type_code === 801 || img.is_primary);
      const selected = homeImage || this.property.images[0];
      const url = this.resolveMediaUrl((selected as any).image_url || (selected as any).url);
      if (url) {
        return url;
      }
    }
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop';
  }

  getPropertyLocation(): string {
    const parts = (this.property.address || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    }
    return parts[0] || 'Location not specified';
  }

  priceLabel(): string {
    const amount = Number(this.property.price_per_day);
    if (!amount) return '';
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }

  getPropertyStatus(): string {
    switch (this.property.state) {
      case 601: return 'Draft';
      case 602: return 'Submitted';
      case 603: return 'Under Review';
      case 604: return 'Approved';
      case 605: return 'Live';
      case 606: return 'Rejected';
      case 607: return 'Suspended';
      default: return 'Active';
    }
  }

  getStatusClass(): string {
    if (this.property.state === 605) return 'live';
    if (this.property.state === 601) return 'draft';
    if (this.property.state === 606 || this.property.state === 607) return 'rejected';
    return 'active';
  }
}
