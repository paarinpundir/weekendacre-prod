import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DualCarousel, CarouselSlide } from '../dual-carousel/dual-carousel';
import { ExperienceCards, ExperienceCard } from '../experience-cards/experience-cards';
import { MembershipSection } from '../membership-section/membership-section';
import { AttractionsSection, Attraction } from '../attractions-section/attractions-section';
import { EventsSection, Event } from '../events-section/events-section';
import { MembershipRegistration, MembershipType } from '../membership-registration/membership-registration';
import { ContactSection } from '../contact-section/contact-section';
import { GallerySection, GalleryPhoto } from '../gallery-section/gallery-section';
import { PropertyCard } from '../../property/property-card/property-card';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { themeCss } from '../../../core/theme-css-vars';

interface PhotoSlot {
  /** Real image path once you have it, e.g. 'assets/photos/hero-field.jpg'. Empty = show placeholder. */
  src: string;
  alt: string;
  /** Shown only when src is empty — tells you (and anyone else on the team) what to shoot/drop in. */
  label: string;
  aspect: string; // CSS aspect-ratio, e.g. '4 / 5'
  rotate?: number; // small tilt in degrees, for the handmade feel
}

interface FarmBlock {
  title: string;
  copy: string;
  photo: PhotoSlot;
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink, 
    CommonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly heroPhoto: PhotoSlot = {
    src: 'assets/photos/hero-field.jpeg',
    alt: 'Weekend Acres field at golden hour',
    label: 'photo: the field, golden hour — this is the one people should feel first',
    aspect: '4 / 3'
  };

  readonly blocks: FarmBlock[] = [
    {
      title: 'Stay',
      copy: 'Away from the city, in simple yet spacious rooms — within the kind of dark you forget exists near Delhi.',
      photo: { src: 'assets/photos/stay.jpeg', alt: 'A guest room at Weekend Acres', label: 'photo: a made-up room, daylight', aspect: '1 / 1', rotate: -2 }
    },
    {
      title: 'Eat',
      copy: 'Nothing on your plate has travelled further than the fields beside it — cooked in a kitchen with no walls.',
      photo: { src: 'assets/photos/eat.jpg', alt: 'Open-kitchen cooking at Weekend Acres', label: 'photo: chulha / grill fire, close-up', aspect: '1 / 1', rotate: 2 }
    },
    {
      title: 'Belong',
      copy: 'Come back, and keep coming back. It starts to feel less like a getaway, more like a home away from home.',
      photo: { src: 'assets/photos/people.jpeg', alt: 'Guests gathered at the long table', label: 'photo: long table, people mid-laugh', aspect: '1 / 1', rotate: -1.5 }
    }
  ];

  /** A loose strip of farm-life shots — the "show, don't tell" moment on this version of the page. */
  readonly peekPhotos: PhotoSlot[] = [
  { src: 'assets/photos/bird.JPG', alt: 'bird', label: 'photo: bird', aspect: '3 / 4', rotate: -3 },
  { src: 'assets/photos/flower.jpeg', alt: 'Hands feeling flowers', label: 'photo: hands, harvest, close-up', aspect: '4 / 5', rotate: 2 },
  { src: 'assets/photos/lounge.jpeg', alt: 'lounge', label: 'photo: resting', aspect: '4 / 3', rotate: -1 },
  { src: 'assets/photos/paint.JPG', alt: 'wall painting', label: 'photo: wall paint, hands on', aspect: '3 / 4', rotate: 3 },
  { src: 'assets/photos/tractor.jpeg', alt: 'tractor', label: 'photo: tractor, outdoors', aspect: '16 / 9', rotate: -2 }
];
}