import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './property-card.html',
  styleUrl: './property-card.scss'
})
export class PropertyCard {
  @Input() property!: Property;
  private readonly backendBaseUrl = 'http://localhost:8080';

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
    if (this.property.address) {
      // Extract city/area from address if possible
      const parts = this.property.address.split(',');
      return parts[parts.length - 1]?.trim() || this.property.address;
    }
    return 'Location not specified';
  }

  getPropertyStatus(): string {
    if (this.property.state === 601) {
      return 'Draft';
    }
    return 'Active';
  }
}
