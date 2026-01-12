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

  getPropertyImage(): string {
    // Use a placeholder image for now - in production, use property.images[0] or default
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

