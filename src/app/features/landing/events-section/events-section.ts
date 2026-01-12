import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Event {
  id: string;
  title: string;
  description: string;
  theme?: string;
  highlights?: string[];
  imageUrl?: string;
  date?: string;
}

@Component({
  selector: 'app-events-section',
  imports: [CommonModule],
  templateUrl: './events-section.html',
  styleUrl: './events-section.scss'
})
export class EventsSection {
  @Input() events: Event[] = [];
  @Input() title = 'Upcoming Events';
}

