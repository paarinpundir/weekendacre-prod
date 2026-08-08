import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface PhotoSlot {
  /** Real image path once you have it, e.g. 'assets/photos/fields.jpg'. Empty = show placeholder. */
  src: string;
  alt: string;
  /** Shown only when src is empty — tells you (and anyone else on the team) what to shoot/drop in. */
  label: string;
  aspect: string; // CSS aspect-ratio, e.g. '4 / 5'
  rotate?: number; // small tilt in degrees, for the handmade feel
}
 
interface MapPin {
  x: number; // position on the map svg, viewBox 0 0 320 220
  y: number;
}
 
interface TrailStop {
  number: string;
  title: string;
  copy: string;
  photo: PhotoSlot;
  pin: MapPin;
}
 
interface FarmStat {
  value: string;
  label: string;
  rotate?: number;
}

@Component({
  selector: 'app-our-farm',
  imports: [CommonModule, RouterLink],
  templateUrl: './our-farm.html',
  styleUrl: './our-farm.scss',
})
export class OurFarm {
  readonly heroPhoto: PhotoSlot = {
    src: 'assets/photos/DSC_6331.JPG',
    alt: 'The farm at Weekend Acres, wide shot',
    label: 'photo: the whole spread, drone or from the water tank — this is the "you are here" shot',
    aspect: '16 / 9'
  };
 
  /** The trail path, in the loose order most people end up walking it. Doubles as the map's pin order. */
  readonly trail: TrailStop[] = [
    {
      number: '01',
      title: 'The Fields',
      copy: 'Twenty acres of open land, worked the way it always has been — mustard in winter, wheat before the heat sets in.',
      photo: { src: 'assets/photos/abc.jpeg', alt: 'Open fields at Weekend Acres', label: 'photo: fields, low light, someone walking the edge', aspect: '4 / 5', rotate: -2 },
      pin: { x: 42, y: 36 }
    },
    {
      number: '02',
      title: 'The Orchard',
      copy: 'Guava, mango, and a few trees nobody quite remembers planting. Pick what you find on the ground.',
      photo: { src: 'assets/photos/def.jpeg', alt: 'Fruit trees in the orchard', label: 'photo: orchard canopy, dappled light', aspect: '1 / 1', rotate: 2 },
      pin: { x: 232, y: 52 }
    },
    {
      number: '03',
      title: 'The Flora',
      copy: 'Tree A, Species B, and  who run the place better than we do. Mornings start by watering them.',
      photo: { src: 'assets/photos/abc.jpeg', alt: 'trees', label: 'photo: tree, close-up, leaves or flowers', aspect: '4 / 5', rotate: -1.5 },
      pin: { x: 62, y: 108 }
    },
    {
      number: '04',
      title: 'The Kitchen Garden',
      copy: 'Whatever\'s in season goes straight from this patch to the plate — usually within the hour.',
      photo: { src: 'assets/photos/maggi.jpeg', alt: 'Kitchen garden with vegetables', label: 'photo: hands in soil, vegetables in a basket', aspect: '1 / 1', rotate: 1.5 },
      pin: { x: 222, y: 128 }
    },
    {
      number: '05',
      title: 'The Water\'s Edge',
      copy: 'A pond that fills up with the monsoon and empties out slow. Good for sitting, better for nothing at all.',
      photo: { src: 'assets/photos/bird.JPG', alt: 'Pond at the edge of the farm', label: 'photo: pond, early morning mist if we get lucky', aspect: '4 / 5', rotate: -2.5 },
      pin: { x: 68, y: 178 }
    },
    {
      number: '06',
      title: 'The Workshop',
      copy: 'Where the tractor gets fixed, the wood gets cut, and most of what you\'ll see around the farm gets made.',
      photo: { src: 'assets/photos/ghi.jpeg', alt: 'The farm workshop and barn', label: 'photo: tools on a wall, or someone mid-repair', aspect: '1 / 1', rotate: 2 },
      pin: { x: 238, y: 182 }
    }
  ];
 
  /** SVG path string connecting the pins above, in order — keep in sync if you reorder the trail. */
  readonly trailPath =
    'M42,36 C130,14 190,40 232,52 C160,88 100,84 62,108 ' +
    'C158,142 188,108 222,128 C150,170 104,150 68,178 ' +
    'C150,208 202,158 238,182';
 
  readonly stats: FarmStat[] = [
    { value: '20', label: 'acres, working farm', rotate: -1.5 },
    { value: '2.5', label: 'hrs from Delhi', rotate: 1 },
    { value: '100+', label: 'flora species, any given day', rotate: -1 },
    { value: '0', label: 'notifications that matter', rotate: 1.5 }
  ];
 
  /** A loose, unscripted handful for the closing cluster — not a strip, just what the day left behind. */
  readonly closingPhotos: PhotoSlot[] = [
    { src: 'assets/photos/hero-field.jpeg', alt: 'Morning feed round', label: 'photo: feeding the animals, early light', aspect: '3 / 4', rotate: -4 },
    { src: 'assets/photos/overview-pond.jpeg', alt: 'The pond at dusk', label: 'photo: pond, golden hour', aspect: '4 / 5', rotate: 3 },
    { src: 'assets/photos/erk.jpeg', alt: 'Farm dog resting in the yard', label: 'photo: farm dog or cat, mid-nap', aspect: '1 / 1', rotate: -2 }
  ];
}