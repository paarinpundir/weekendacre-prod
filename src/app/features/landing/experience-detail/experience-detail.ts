import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EXPERIENCE_DETAILS, ExperienceDetailContent } from './experience-detail.data';

@Component({
  selector: 'app-experience-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './experience-detail.html',
  styleUrl: '../story-detail.page.scss',
})
export class ExperienceDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  content: ExperienceDetailContent | null = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const found = slug ? EXPERIENCE_DETAILS[slug] : undefined;
    if (!found) {
      void this.router.navigate(['/']);
      return;
    }
    this.content = found;
  }
}
