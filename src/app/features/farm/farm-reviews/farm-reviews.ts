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

  getStarStates(rating: number): ('full' | 'half' | 'empty')[] {
    const r = Math.min(5, Math.max(0, rating));
    const out: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (r >= i) out.push('full');
      else if (r >= i - 0.5) out.push('half');
      else out.push('empty');
    }
    return out;
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


