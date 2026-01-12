import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../core/models/user.model';

@Component({
  selector: 'app-farm-reviews',
  imports: [CommonModule],
  templateUrl: './farm-reviews.html',
  styleUrl: './farm-reviews.scss'
})
export class FarmReviews {
  @Input() reviews: Review[] = [];
  @Input() overallRating?: number;
  @Input() reviewCount?: number;

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
    return stars;
  }

  getRatingPercentage(rating: number): number {
    return (rating / 5) * 100;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Recently';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}


