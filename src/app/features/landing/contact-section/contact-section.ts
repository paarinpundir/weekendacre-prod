import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss'
})
export class ContactSection {
  @Input() phone = '+91 1234567890';
  @Input() email = 'contact@greentrail.com';
  @Input() address = 'WeekendAcres, India';
  @Input() latitude?: number;
  @Input() longitude?: number;

  formData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Contact form submitted:', this.formData);
      // In real app, this would call an API
      alert('Thank you for your message! We will get back to you soon.');
      this.formData = { name: '', email: '', phone: '', message: '' };
      form.resetForm();
    }
  }

  getMapUrl(): string {
    if (this.latitude && this.longitude) {
      return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.address)}`;
  }

  getMapIframeUrl(): string {
    if (this.latitude && this.longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6U4UYZu5j9k&q=${this.latitude},${this.longitude}`;
    }
    return '';
  }
}

