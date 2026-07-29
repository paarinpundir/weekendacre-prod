import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EVENT_DETAILS, EventDetailContent } from './event-detail.data';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: '../story-detail.page.scss',
})
export class EventDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  content: EventDetailContent | null = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const found = slug ? EVENT_DETAILS[slug] : undefined;
    if (!found) {
      void this.router.navigate(['/']);
      return;
    }
    this.content = found;
  }
}
