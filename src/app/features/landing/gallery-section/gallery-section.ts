import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  /** Grid span size — creates the masonry rhythm. 'tall' spans two rows. */
  size?: 'tall' | 'normal';
}

@Component({
  selector: 'app-gallery-section',
  imports: [CommonModule],
  templateUrl: './gallery-section.html',
  styleUrl: './gallery-section.scss'
})
export class GallerySection {
  @Input() photos: GalleryPhoto[] = [];

  lightboxIndex: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  openLightbox(index: number) {
    this.lightboxIndex = index;
    this.cdr.detectChanges();
  }

  closeLightbox() {
    this.lightboxIndex = null;
    this.cdr.detectChanges();
  }

  next(event: Event) {
    event.stopPropagation();
    if (this.lightboxIndex === null) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.photos.length;
    this.cdr.detectChanges();
  }

  prev(event: Event) {
    event.stopPropagation();
    if (this.lightboxIndex === null) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.photos.length) % this.photos.length;
    this.cdr.detectChanges();
  }
}
