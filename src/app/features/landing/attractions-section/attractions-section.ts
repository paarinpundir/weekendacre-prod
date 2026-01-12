import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Attraction {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'app-attractions-section',
  imports: [CommonModule],
  templateUrl: './attractions-section.html',
  styleUrl: './attractions-section.scss'
})
export class AttractionsSection {
  @Input() attractions: Attraction[] = [];
  @Output() attractionClick = new EventEmitter<Attraction>();

  onAttractionClick(attraction: Attraction) {
    this.attractionClick.emit(attraction);
  }
}

