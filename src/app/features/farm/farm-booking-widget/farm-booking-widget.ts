import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Farm } from '../../../core/models/farm.model';

@Component({
  selector: 'app-farm-booking-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './farm-booking-widget.html',
  styleUrl: './farm-booking-widget.scss'
})
export class FarmBookingWidget {
  @Input() farm!: Farm;
  @Output() bookNow = new EventEmitter<void>();

  checkIn = '';
  checkOut = '';
  guests = 1;

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onBookNow() {
    this.bookNow.emit();
  }

  getPriceForNights(): number {
    const nights = this.getNights();
    return (this.farm.pricePerDay || 0) * nights;
  }

  getNights(): number {
    if (!this.checkIn || !this.checkOut) return 1;
    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }
}
