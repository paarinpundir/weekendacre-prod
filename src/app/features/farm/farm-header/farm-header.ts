import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Farm } from '../../../core/models/farm.model';

@Component({
  selector: 'app-farm-header',
  imports: [CommonModule],
  templateUrl: './farm-header.html',
  styleUrl: './farm-header.scss'
})
export class FarmHeader {
  @Input() farm!: Farm;
  @Input() showGuestFavourite = false;

  getRatingStars(rating?: number): string {
    if (!rating) return '★★★★★';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
    return stars;
  }
}


