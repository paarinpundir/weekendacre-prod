import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmImage } from '../../../core/models/farm.model';

@Component({
  selector: 'app-farm-image-gallery',
  imports: [CommonModule],
  templateUrl: './farm-image-gallery.html',
  styleUrl: './farm-image-gallery.scss'
})
export class FarmImageGallery {
  @Input() images: FarmImage[] = [];
  @Input() selectedIndex = 0;
  @Output() imageSelected = new EventEmitter<number>();

  selectImage(index: number) {
    this.selectedIndex = index;
    this.imageSelected.emit(index);
  }

  getImageUrl(image: FarmImage | string): string {
    if (!image) return 'https://via.placeholder.com/800x600?text=No+Image';
    if (typeof image === 'string') return image;
    return image.imageUrl || '';
  }

  showAllPhotos() {
    // Could open a modal or navigate to full gallery
    console.log('Show all photos');
  }
}


