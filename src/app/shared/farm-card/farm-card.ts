import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Farm } from '../../core/models/farm.model';

@Component({
  selector: 'app-farm-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './farm-card.html',
  styleUrl: './farm-card.scss'
})
export class FarmCard {
  @Input() farm!: Farm;
  @Input() showGuestFavourite = false;

  getImageUrl(image: any): string {
    if (!image) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (typeof image === 'string') return image;
    return image.imageUrl || image.url || '';
  }

  getPrimaryImage(): string {
    if (!this.farm.images || this.farm.images.length === 0) {
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    const primaryImage = this.farm.images.find(img => img.isPrimary);
    if (primaryImage) {
      return this.getImageUrl(primaryImage);
    }
    return this.getImageUrl(this.farm.images[0]);
  }
}

