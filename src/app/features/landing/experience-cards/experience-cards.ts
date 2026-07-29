import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ExperienceCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor?: string;
}

@Component({
  selector: 'app-experience-cards',
  imports: [CommonModule, RouterLink],
  templateUrl: './experience-cards.html',
  styleUrl: './experience-cards.scss'
})
export class ExperienceCards {
  @Input() cards: ExperienceCard[] = [];
}

