import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PhotoSlot {
  /** Real image path once you have it, e.g. 'assets/photos/team/ashish.jpg'. Empty = show placeholder. */
  src: string;
  alt: string;
  /** Shown only when src is empty — tells whoever's shooting what's needed. */
  label: string;
  rotate: number; // small tilt in degrees, for the pinned-up feel
}
 
type PinColor = 'gold' | 'rust' | 'moss';
 
interface Member {
  name: string;
  photo: PhotoSlot;
  pin: PinColor;
}
 
interface Team {
  title: string;
  /** The parenthetical line from the brief, where one exists. Some teams don't have one — that's fine. */
  tagline: string;
  members: Member[];
}

@Component({
  selector: 'app-wa-team',
  imports: [CommonModule, FormsModule],
  templateUrl: './wa-team.html',
  styleUrl: './wa-team.scss',
})
export class WaTeam {
  readonly contactEmail = 'weekendacres@gmail.com';
  readonly contactPhone = '0123456789';
 
  // Kept simple on purpose — no backend here, so the form just hands off to the visitor's own mail app.
  contactName = '';
  contactFrom = '';
  contactMessage = '';
 
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
 
  /** One photo/name/pin defined per person — teams below just reference these, so nobody's details drift out of sync. */
  private readonly members: Record<string, Member> = {
    ashish: { name: 'Ashish Pundir', photo: { src: 'assets/photos/ashish.png', alt: 'Ashish Pundir', label: 'photo: Ashish, outdoors, in the fields', rotate: -2 }, pin: 'moss' },
    ashutosh: { name: 'Ashutosh Tripathi', photo: { src: '', alt: 'Ashutosh Tripathi', label: 'photo: Ashutosh, candid', rotate: 2 }, pin: 'gold' },
    pushkar: { name: 'Pushkar Barnwal', photo: { src: 'assets/photos/pushkar.jpeg', alt: 'Pushkar Barnwal', label: 'photo: Pushkar, candid', rotate: -2.5 }, pin: 'rust' },
    paarin: { name: 'Paarin Pundir', photo: { src: 'assets/photos/paarin.jpeg', alt: 'Paarin Pundir', label: 'photo: Paarin, candid', rotate: 3 }, pin: 'moss' },
    pranav: { name: 'Pranav Saxena', photo: { src: 'assets/photos/pranav.jpeg', alt: 'Pranav Saxena', label: 'photo: Pranav, candid', rotate: -2 }, pin: 'gold' },
    mamta: { name: 'Mamta Pundir', photo: { src: 'assets/photos/mamta.png', alt: 'Mamta Pundir', label: 'photo: Mamta, kitchen or grounds', rotate: 2.5 }, pin: 'rust' },
    sarita: { name: 'Sarita Pundir', photo: { src: '', alt: 'Sarita Pundir', label: 'photo: Sarita, kitchen', rotate: -3 }, pin: 'gold' },
    anusha: { name: 'Anusha Pundir', photo: { src: 'assets/photos/anusha.png', alt: 'Anusha Pundir', label: 'photo: Anusha, candid', rotate: 2 }, pin: 'moss' },
    shivin: { name: 'Shivin Pundir', photo: { src: 'assets/photos/shivin.png', alt: 'Shivin Pundir', label: 'photo: Shivin, near the water or the hives', rotate: -2.5 }, pin: 'rust' },
    vimlesh: { name: 'Vimlesh Yadav', photo: { src: '', alt: 'Vimlesh Yadav', label: 'photo: Vimlesh, workshop or at dusk', rotate: 3 }, pin: 'gold' },
    rahul: { name: 'Rahul', photo: { src: '', alt: 'Rahul', label: 'photo: Rahul, workshop or at dusk', rotate: -2 }, pin: 'moss' },
    riya: { name: 'Riya Pundir', photo: { src: 'assets/photos/riya.png', alt: 'Riya Pundir', label: 'photo: Riya, candid, near her work', rotate: 2.5 }, pin: 'rust' },
    tanishka: { name: 'Tanishka Saxena', photo: { src: 'assets/photos/tanishka.jpeg', alt: 'Tanishka Saxena', label: 'photo: Tanishka, candid', rotate: -3 }, pin: 'gold' }
  };
 
  /** The lead of the farm, called out on their own above the team sections. */
  readonly leader = {
    role: 'Chief Executive Gardener (CEG)',
    tagline: 'Keeping it natural.',
    member: this.members['ashish']
  };
 
  /** Teams in the order they appear in the brief. People on more than one team show up in each — same photo, same name, no repeated role text. */
  readonly teams: Team[] = [
    {
      title: 'Organic Bits and Bytes',
      tagline: 'The invisible tech backbone.',
      members: [this.members['ashutosh'], this.members['pushkar'], this.members['paarin'], this.members['pranav']]
    },
    {
      title: 'Culinary Capers',
      tagline: '',
      members: [this.members['mamta'], this.members['sarita']]
    },
    {
      title: 'Working IT',
      tagline: 'Coding never stops here, bring in your ideas.',
      members: [this.members['ashutosh'], this.members['pushkar'], this.members['paarin']]
    },
    {
      title: 'Word Weavers',
      tagline: 'Weaving words amidst nature.',
      members: [this.members['anusha']]
    },
    {
      title: 'Neat as a Pin',
      tagline: 'Farm operations and maintenance.',
      members: [this.members['mamta']]
    },
    {
      title: 'Cheers to That',
      tagline: 'Watering holes, bee keepers, bird nests, bird watchers.',
      members: [this.members['shivin']]
    },
    {
      title: 'Switch up your Lighting',
      tagline: 'Subtle lighting transforms the farm when the sun sets.',
      members: [this.members['vimlesh'], this.members['rahul']]
    },
    {
      title: 'Clever Connections',
      tagline: 'They help us grow.',
      members: [this.members['anusha']]
    },
    {
      title: 'The Eco Artists',
      tagline: 'Turning yard into an artistic choice.',
      members: [this.members['riya']]
    },
    {
      title: 'My DIY Weekend',
      tagline: 'Motors and gears for gardeners.',
      members: [this.members['vimlesh'], this.members['rahul']]
    },
    {
      title: 'Eco Chic',
      tagline: 'Doing your bit for the environment without giving up the weekend break.',
      members: [this.members['anusha'], this.members['tanishka']]
    }
  ];
 
  /** Team names from the brief with nobody assigned yet — shown lightly at the bottom, not as empty sections. */
  readonly openRoles: string[] = [
    'Landscape Designs',
    'Grill Thrill',
    'Do Yourself a Flavour',
    'The Fun Zone and Poolside Play',
    'Be Kind to the Earth',
    'Twinkle Twinkle Team'
  ];
}