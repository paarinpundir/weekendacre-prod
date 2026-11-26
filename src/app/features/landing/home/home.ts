import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PropertyCard } from '../../property/property-card/property-card';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';

interface PhotoSlot {
  /** Real image path once you have it, e.g. 'assets/photos/hero-field.jpg'. Empty = show placeholder. */
  src: string;
  alt: string;
  /** Shown only when src is empty — tells you (and anyone else on the team) what to shoot/drop in. */
  label: string;
  aspect: string; // CSS aspect-ratio, e.g. '4 / 3'
}

interface TrailStop {
  /** Short waypoint tag, e.g. 'Stop one' — echoes the trail/waypoint device used across the page. */
  tag: string;
  title: string;
  copy: string;
  photo: PhotoSlot;
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    PropertyCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly propertyService = inject(PropertyService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly contactEmail = 'weekendacres@gmail.com';
  readonly contactPhone = '0123456789';

  contactName = '';
  contactFrom = '';
  contactMessage = '';

  liveFarms: Property[] = [];
  liveFarmsLoading = true;
  liveFarmsError: string | null = null;

  ngOnInit(): void {
    this.loadLiveFarms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLiveFarms(): void {
    this.liveFarmsLoading = true;
    this.liveFarmsError = null;

    this.propertyService.getAllProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const farms = Array.isArray(response?.data) ? response.data : [];
          // Public API already returns Live (605); keep a client-side guard.
          this.liveFarms = farms.filter((farm) => farm.state === 605);
          this.liveFarmsLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load live farms:', err);
          this.liveFarms = [];
          this.liveFarmsError = 'Live farms could not be loaded right now.';
          this.liveFarmsLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get mailtoHref(): string {
    return `mailto:${this.contactEmail}`;
  }

  get telHref(): string {
    return `tel:${this.contactPhone}`;
  }

  sendMessage(): void {
    const subject = encodeURIComponent(
      this.contactName ? `Message from ${this.contactName} — Weekend Acres site` : 'Message from the Weekend Acres site'
    );
    const bodyLines = [
      this.contactMessage || '',
      '',
      '—',
      this.contactName || '(no name given)',
      this.contactFrom || '(no email given)'
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:${this.contactEmail}?subject=${subject}&body=${body}`;
  }

  readonly heroPhoto: PhotoSlot = {
    src: 'assets/photos/hero-field.jpeg',
    alt: 'Weekend Acres field at golden hour',
    label: 'photo: the field, golden hour — this is the one people should feel first',
    aspect: '5 / 4'
  };

  /** Stay / Eat / Belong, now presented as stops along the trail — editorial zigzag rows. */
  readonly stops: TrailStop[] = [
    {
      tag: 'Stop one',
      title: 'Stay',
      copy: 'Away from the city, in simple yet spacious rooms — within the kind of dark you forget exists near Delhi.',
      photo: { src: 'assets/photos/room-stay.png', alt: 'A guest room at Weekend Acres', label: 'photo: a made-up room, daylight', aspect: '4 / 3' }
    },
    {
      tag: 'Stop two',
      title: 'Eat',
      copy: 'Nothing on your plate has travelled further than the fields beside it — cooked in a kitchen with no walls.',
      photo: { src: 'assets/photos/eat.jpg', alt: 'Open-kitchen cooking at Weekend Acres', label: 'photo: chulha / grill fire, close-up', aspect: '4 / 3' }
    },
    {
      tag: 'Stop three',
      title: 'Belong',
      copy: 'Come back, and keep coming back. It starts to feel less like a getaway, more like a home away from home.',
      photo: { src: 'assets/photos/people.jpeg', alt: 'Guests gathered at the long table', label: 'photo: long table, people mid-laugh', aspect: '4 / 3' }
    }
  ];

  /**
   * A scattered "photo wall" — five farm-life shots arranged like a bulletin board.
   * Order matters here: it maps 1:1 onto the .w1–.w5 layout slots in home.scss,
   * so keep this list at exactly 5 items (or extend the .wN rules if you add more).
   */
  readonly peekPhotos: PhotoSlot[] = [
    { src: 'assets/photos/family.png', alt: 'fun', label: 'photo: tree-fun', aspect: '2 / 3' },
    { src: 'assets/photos/pond1.png', alt: 'Hands feeling flowers', label: 'photo: hands, harvest, close-up', aspect: '1 / 1' },
    { src: 'assets/photos/paint.JPG', alt: 'wall painting', label: 'photo: wall paint, hands on', aspect: '2 / 3' },
    { src: 'assets/photos/lounge.jpeg', alt: 'lounge', label: 'photo: resting', aspect: '1 / 1' },
    { src: 'assets/photos/planting-people.png', alt: 'people', label: 'photo: tractor, outdoors', aspect: '3 / 1' },
    { src: 'assets/photos/pool-fun.jpeg', alt: 'pool fun', label: 'photo: people in pool', aspect: '2 / 3' }
  ];

  /** The hand-illustrated route map — the trail's destination. */
  readonly mapPhoto: PhotoSlot = {
    src: 'assets/photos/map-final.jpeg',
    alt: 'Illustrated map showing the route to Weekend Acres: 1 hour from Rishikesh, 30 minutes from Dehradun',
    label: 'map: route illustration, Rishikesh & Dehradun to the farm',
    aspect: '3 / 2'
  };
}
