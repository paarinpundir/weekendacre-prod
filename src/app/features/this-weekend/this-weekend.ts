import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface PhotoSlot {
  src: string;
  alt: string;
  label: string;
  aspect: string;
  rotate?: number;
  caption?: string; // used by the hero polaroid only
}
 
interface DayItem {
  number: string; // '01', '02'...
  time: string;
  title: string;
  copy: string;
}
 
interface CrowdFact {
  value: string;
  label: string;
}
 
interface PracticalNote {
  eyebrow: string;
  title: string;
  copy: string;
  pending?: boolean;
  pendingNote?: string;
  rotate?: number;
}

@Component({
  selector: 'app-this-weekend',
  imports: [CommonModule, RouterLink],
  templateUrl: './this-weekend.html',
  styleUrl: './this-weekend.scss',
})
export class ThisWeekend {
  readonly heroPhoto: PhotoSlot = {
    src: 'assets/photos/hero-field.jpeg',
    alt: 'Guests gathered on the farm over a weekend',
    label: 'photo: candid, guests mid-weekend',
    aspect: '4 / 5',
    rotate: 4,
    caption: 'a weekend, roughly',
  };
 
  readonly dayPhoto: PhotoSlot = {
    src: 'assets/photos/people.jpeg',
    alt: 'The long table set for dinner under the trees',
    label: 'photo: long table or fire, one strong supporting shot',
    aspect: '4 / 5',
    rotate: -3,
  };
 
  readonly moments: DayItem[] = [
    { number: '01', time: 'Afternoon', title: 'Arrival', copy: 'You arrive by afternoon and settle into simple rooms, a short walk from the fields.' },
    { number: '02', time: 'Before dinner', title: 'The Walk', copy: 'A walk through what\u2019s growing, so you\u2019ve seen where the meal came from before it reaches you.' },
    { number: '03', time: 'Evening', title: 'Open Fires', copy: 'The fires are already going by evening: a chulha, a grill, sometimes a tandoor.' },
    { number: '04', time: 'Dinner', title: 'Dinner, Your Way', copy: 'The long table under the trees, a charpai by the pond, or cushions under a tree of your own choosing.' },
    { number: '05', time: 'Morning', title: 'Slow Mornings', copy: 'Unhurried \u2014 a walk, quiet, and coffee that takes as long as you want it to.' },
    { number: '06', time: 'Afternoon', title: 'Slow Afternoons', copy: 'Naps, books, and crafty activities of your choosing \u2014 the day asks nothing of you.' },
    { number: '07', time: 'All day', title: 'For the Little Ones', copy: 'A patch to dig in, something to sow, room to run, and games to play.' },
  ];
 
  readonly crowdFacts: CrowdFact[] = [
    { value: 'Twenty', label: 'guests' },
    { value: 'One', label: 'acre' },
    { value: 'No', label: 'fixed table' },
  ];
 
  /* ---- unchanged from before: keep exactly as is ---- */
  readonly practicalNotes: PracticalNote[] = [
    {
      eyebrow: 'Booking',
      title: 'How it works',
      copy: 'Stays and single-day visits are limited, and go through our WhatsApp group / app — first come, first held. We ask you to confirm a few days ahead so the kitchen can plan around what\u2019s actually ready to harvest that week.',
      rotate: -2,
    },
    {
      eyebrow: 'Price',
      title: 'What it costs',
      copy: '',
      pending: true,
      pendingNote: 'to be set once the first few weekends have run',
      rotate: 1.5,
    },
    {
      eyebrow: 'Good to know',
      title: 'Before you come',
      copy: 'Comfortable shoes for the walk. This is an outdoor, weather-led weekend — we\u2019ll tell you in advance if dates need to move. Come as you are; there\u2019s no dress code here, only good vibes.',
      rotate: -1,
    },
  ];
}