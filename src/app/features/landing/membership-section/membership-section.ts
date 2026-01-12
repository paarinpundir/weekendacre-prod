import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-membership-section',
  imports: [CommonModule, RouterLink],
  templateUrl: './membership-section.html',
  styleUrl: './membership-section.scss'
})
export class MembershipSection {
  @Input() title = 'A world of experiences—exclusively for our members';
  @Input() subtext = 'Discover personal access, privileges, and curated moments.';
  @Input() ctaText = 'Register';
  @Input() ctaLink = '/partner/signup';
}

