import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface MembershipType {
  id: string;
  name: string;
  description?: string;
  price?: string;
  features?: string[];
}

@Component({
  selector: 'app-membership-registration',
  imports: [CommonModule, RouterLink],
  templateUrl: './membership-registration.html',
  styleUrl: './membership-registration.scss'
})
export class MembershipRegistration {
  @Input() membershipTypes: MembershipType[] = [];
  @Input() farmOwnerTitle = 'If you are a Farm Owner…';
  @Input() farmOwnerText = 'Become part of our growing farm network and unlock new opportunities.';
  @Input() farmOwnerLink = '/partner/signup';
}

