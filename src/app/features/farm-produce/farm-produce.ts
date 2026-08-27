import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
 
interface ProduceCategory {
  glyph: string;
  title: string;
  items: string;
  note: string;
}
 
interface FarmBagStep {
  number: string;
  title: string;
  description: string;
}
 
interface TraceFeature {
  glyph: string;
  title: string;
  description: string;
}
 
interface OtherWay {
  tag: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-farm-produce',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './farm-produce.html',
  styleUrl: './farm-produce.scss',
})
export class FarmProduce implements AfterViewInit {
  @ViewChildren('reveal') private revealEls!: QueryList<ElementRef<HTMLElement>>;
 
  readonly categories: ProduceCategory[] = [
    {
      glyph: '🥬',
      title: 'Seasonal Vegetables',
      items: 'Spinach, methi, mustard greens, pumpkin, tinda, bottle gourd, ridge gourd.',
      note: 'Grown without synthetic pesticides.',
    },
    {
      glyph: '🥛',
      title: 'Dairy — Select Farms',
      items: 'A2 milk, ghee, and paneer from farms where we know the cows by name.',
      note: 'Limited availability. Serious quality.',
    },
    {
      glyph: '🌾',
      title: 'Grains & Pulses',
      items: 'Chakki-ground wheat flour, maize, mustard, desi chana, masoor.',
      note: 'Farmed with natural cultivation methods.',
    },
    {
      glyph: '🍯',
      title: 'Honey & Preserves',
      items: 'Forest honey, sun-dried vegetables, homemade pickles and chutneys.',
      note: 'Small batches, made when they\u2019re made.',
    },
    {
      glyph: '🌿',
      title: 'Fresh Herbs',
      items: 'Tulsi, coriander, mint, ajwain, lemongrass, grown without chemicals.',
      note: 'Cut and dispatched the same day.',
    },
    {
      glyph: '🫙',
      title: 'Cold-Pressed Oils',
      items: 'Mustard and sesame oil, traditional wood-pressed, from partner farms.',
      note: 'No refining. No additives.',
    },
  ];
 
  readonly steps: FarmBagStep[] = [
    {
      number: '01',
      title: 'Browse the fortnight\u2019s list',
      description:
        'Every two weeks, our partner farms update what\u2019s ready to pick and pack. You see a live list \u2014 vegetables, grains, dairy, herbs, oils.',
    },
    {
      number: '02',
      title: 'Fill your bag your way',
      description:
        'No fixed box, no forced combination. You decide the mix. A minimum bag value of \u20b91,500 keeps the delivery worthwhile for the farms too.',
    },
    {
      number: '03',
      title: 'Lock it by the deadline',
      description:
        'Edit your bag right up to the fortnightly cut-off. After that, we send your order to the farms and they start packing. You\u2019ll get a confirmation.',
    },
    {
      number: '04',
      title: 'Receive it at your door',
      description:
        'Your bag arrives in a reusable jute carrier with farm cards inside. Check what arrived, read where it came from, send the jute bag back next round.',
    },
  ];
 
  readonly traceFeatures: TraceFeature[] = [
    {
      glyph: '',
      title: 'What\u2019s in every box',
      description:
        'A farm card with the farm name, the farmer\u2019s name, the harvest date, and a QR code linking to their profile on Weekend Acres.',
    },
    {
      glyph: '',
      title: 'Track your food online',
      description:
        'Scan the QR to see the farm\u2019s full profile \u2014 photos, the farmer\u2019s story, growing practices, and upcoming farm-stay dates.',
    },
    {
      glyph: '',
      title: 'Members who stay, also eat',
      description:
        'Done a farm stay with us? Your produce order always carries a note from that same farm \u2014 closing the loop between the visit and the meal.',
    },
  ];
 
  readonly honestNotes: string[] = [
    'Availability changes every fortnight \u2014 that\u2019s the point, not a bug.',
    'We don\u2019t pad the bag with filler. A short harvest means fewer options, never an untraceable substitute.',
    'Pause your Farm Bag for any fortnight from your account. No calls, no explanations needed.',
    'First-time members can start with a trial fortnight, no membership commitment.',
  ];
 
  readonly otherWays: OtherWay[] = [
    {
      tag: 'No subscription',
      title: 'Single Order',
      description: 'Order a specific item without a fortnightly commitment. It travels with the next dispatch.',
    },
    {
      tag: 'On your visit',
      title: 'Farm-Direct Pickup',
      description:
        'Pre-order produce and collect it during a Weekend Acres stay or day visit \u2014 the farmer packs it while you\u2019re there.',
    },
  ];
 
  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
 
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      this.revealEls.forEach((el) => el.nativeElement.classList.add('is-visible'));
      return;
    }
 
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
 
    this.revealEls.forEach((el) => observer.observe(el.nativeElement));
  }
}