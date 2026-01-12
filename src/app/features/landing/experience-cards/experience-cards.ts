import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ExperienceCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor?: string;
}

@Component({
  selector: 'app-experience-cards',
  imports: [CommonModule],
  templateUrl: './experience-cards.html',
  styleUrl: './experience-cards.scss'
})
export class ExperienceCards {
  @Input() cards: ExperienceCard[] = [];
}

