import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Farm } from '../../../core/models/farm.model';

@Component({
  selector: 'app-farm-header',
  imports: [CommonModule],
  templateUrl: './farm-header.html',
  styleUrl: './farm-header.scss'
})
export class FarmHeader {
  @Input() farm!: Farm;
  @Input() showGuestFavourite = false;

}


