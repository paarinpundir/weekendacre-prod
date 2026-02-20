import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'WeekendAcres';
  currentUrl: string = '';

  constructor(private router: Router) {
    // Set initial URL
    this.currentUrl = this.router.url;

    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
  }

  isOnboardingPage(): boolean {
    const url = this.currentUrl.split('?')[0]; // Remove query params
    return url.includes('/property/onboard') ||
      url.includes('/partner/onboard');
  }

  isPartnerDashboard(): boolean {
    const url = this.currentUrl.split('?')[0]; // Remove query params
    return url === '/partner/dashboard' ||
      url.includes('/property/onboard') ||
      url.startsWith('/partner/');
  }

  isPropertyDetailPage(): boolean {
    const url = this.currentUrl.split('?')[0]; // Remove query params
    return url.startsWith('/properties/');
  }
}
