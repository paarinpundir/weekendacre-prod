import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Farm } from '../../../core/models/farm.model';

@Component({
  selector: 'app-farm-location',
  imports: [CommonModule],
  templateUrl: './farm-location.html',
  styleUrl: './farm-location.scss'
})
export class FarmLocation implements OnInit {
  @Input() farm!: Farm;

  mapUrl = '';

  ngOnInit() {
    if (this.farm.latitude && this.farm.longitude) {
      this.mapUrl = `https://www.google.com/maps?q=${this.farm.latitude},${this.farm.longitude}`;
    }
  }

  getMapIframeUrl(): string {
    if (this.farm.latitude && this.farm.longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6U4UYZu5j9k&q=${this.farm.latitude},${this.farm.longitude}`;
    }
    return '';
  }

  getFullAddress(): string {
    const parts = [
      this.farm.address,
      this.farm.village,
      this.farm.district,
      this.farm.city,
      this.farm.state,
      this.farm.zipCode,
      this.farm.country
    ].filter(Boolean);
    return parts.join(', ');
  }
}

