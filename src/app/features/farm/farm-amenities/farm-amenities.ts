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
      WiFi: 'fa-solid fa-wifi',
      Parking: 'fa-solid fa-square-parking',
      Kitchen: 'fa-solid fa-kitchen-set',
      Electricity: 'fa-solid fa-bolt',
      Pond: 'fa-solid fa-water',
      'Water Source': 'fa-solid fa-faucet-drip',
      'Livable House': 'fa-solid fa-house-chimney',
      'Organic Food': 'fa-solid fa-wheat-awn',
      'Animal Care': 'fa-solid fa-cow',
      'Adventure Activities': 'fa-solid fa-person-hiking',
      Bathroom: 'fa-solid fa-shower',
      TV: 'fa-solid fa-tv',
      'Air Conditioning': 'fa-solid fa-snowflake',
      'Washing Machine': 'fa-solid fa-shirt'
    };
    return iconMap[amenityName] || 'fa-solid fa-circle-check';
  }
}


