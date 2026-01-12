import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmAmenity } from '../../../core/models/farm.model';

@Component({
  selector: 'app-farm-amenities',
  imports: [CommonModule],
  templateUrl: './farm-amenities.html',
  styleUrl: './farm-amenities.scss'
})
export class FarmAmenities {
  @Input() amenities: FarmAmenity[] = [];

  getAmenityIcon(amenityName: string): string {
    const iconMap: { [key: string]: string } = {
      'WiFi': '📶',
      'Parking': '🅿️',
      'Kitchen': '🍳',
      'Electricity': '⚡',
      'Pond': '💧',
      'Water Source': '🚰',
      'Livable House': '🏠',
      'Organic Food': '🌾',
      'Animal Care': '🐄',
      'Adventure Activities': '🎯',
      'Bathroom': '🚿',
      'TV': '📺',
      'Air Conditioning': '❄️',
      'Washing Machine': '🧺'
    };
    return iconMap[amenityName] || '✓';
  }
}


