import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface HeroCta {
  label: string;
  routerLink: string;
  fragment?: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtext: string;
  imageUrl?: string;
  backgroundColor?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
}

@Component({
  selector: 'app-dual-carousel',
  imports: [CommonModule, RouterLink],
  templateUrl: './dual-carousel.html',
  styleUrl: './dual-carousel.scss'
})
export class DualCarousel implements OnInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() autoPlayInterval: number = 5000; // 5 seconds default
  currentIndex = 0;
  private autoPlayTimer?: any;

  get activeSlide(): CarouselSlide | undefined {
    return this.slides?.[this.currentIndex];
  }

  get heroBackgroundImage(): string {
    const url = this.activeSlide?.imageUrl;
    return url ? `url(${url})` : 'none';
  }

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    if (this.slides.length > 1) {
      this.autoPlayTimer = setInterval(() => {
        this.nextSlide();
      }, this.autoPlayInterval);
    }
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    // Restart auto-play after manual navigation
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  onMouseEnter() {
    this.stopAutoPlay();
  }

  onMouseLeave() {
    this.startAutoPlay();
  }
}

