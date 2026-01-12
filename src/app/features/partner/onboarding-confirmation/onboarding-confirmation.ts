import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-onboarding-confirmation',
  imports: [CommonModule, RouterLink],
  templateUrl: './onboarding-confirmation.html',
  styleUrl: './onboarding-confirmation.scss'
})
export class OnboardingConfirmation {
  constructor(private router: Router) {}
  
  goToDashboard() {
    this.router.navigate(['/partner/dashboard']);
  }
}

