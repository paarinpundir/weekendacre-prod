import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Legacy /farms/:id route — redirects into the live Property detail page
 * so one end-to-end detail experience is used for onboarded farms.
 */
@Component({
  selector: 'app-farm-detail',
  imports: [CommonModule],
  template: `
    <div class="redirect-state">
      <div class="spinner"></div>
      <p>Opening live farm details…</p>
    </div>
  `,
  styles: [`
    .redirect-state {
      min-height: 50vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #666;
      font-family: system-ui, sans-serif;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #eee;
      border-top-color: #7c8a54;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class FarmDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit() {
    const farmId = this.route.snapshot.paramMap.get('id');
    if (farmId) {
      this.router.navigate(['/properties', farmId], { replaceUrl: true });
      return;
    }
    this.router.navigate(['/farms'], { replaceUrl: true });
  }
}
