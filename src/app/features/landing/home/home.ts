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

@Component({
  selector: 'app-home',
  imports: [
    RouterLink, 
    CommonModule, 
    DualCarousel,
    ExperienceCards,
    MembershipSection,
    AttractionsSection,
    EventsSection,
    MembershipRegistration,
    ContactSection,
    PropertyCard,
    GallerySection
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  // Carousel slides - Full screen
  carouselSlides: CarouselSlide[] = [
    {
      id: '1',
      title: 'U & V (You and Village)',
      subtext: 'Where weekends slow down, and village life welcomes you home',
      backgroundColor: themeCss.forestHeader,
      imageUrl:
        'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1920&h=1080&fit=crop&q=80',
      primaryCta: {
        label: 'Explore Village Life',
        routerLink: '/',
        fragment: 'experiences-section',
      },
      secondaryCta: {
        label: 'Meet the Community',
        routerLink: '/',
        fragment: 'meet-community-section',
      },
    },
    {
      id: '2',
      title: 'From Our Fields to Your Fork',
      subtext: 'Farm-fresh food on your visit. Farm-bag freshness to your home — taste of nature.',
      backgroundColor: themeCss.forestHeader,
      imageUrl:
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=1080&fit=crop&q=80',
      primaryCta: {
        label: 'Products & Activities',
        routerLink: '/education',
      },
      secondaryCta: {
        label: 'Join Us',
        routerLink: '/booking',
      },
    },
  ];

  // Experience cards - 4 horizontal cards
  experienceCards: ExperienceCard[] = [
    {
      id: '1',
      slug: 'day-escape',
      title: 'Escape for a Day',
      description: 'Picnic under open skies',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800'
    },
    {
      id: '2',
      slug: 'camps-in-the-estate',
      title: 'Camps in the Estate',
      description: 'Come together, live the outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
    },
    {
      id: '3',
      slug: 'make-your-home',
      title: 'Make Your Home',
      description: 'Shared spaces. Shared growth. Shared living.',
      imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800'
    },
    {
      id: '4',
      slug: 'spiritual-getaways',
      title: 'Scenic Farm Days to Spiritual Getaways',
      description: 'Haridwar & Rishikesh await',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    }
  ];

  // Gallery — a glimpse of the on-farm experience (photography-first, hands doing things).
  // Every photo URL below was verified to resolve (HTTP 200) before being added.
  galleryPhotos: GalleryPhoto[] = [
    { id: 'g1', url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1000&q=80&auto=format&fit=crop', caption: 'Morning harvest in the fields', size: 'tall' },
    { id: 'g2', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=80&auto=format&fit=crop', caption: 'Picnic under open skies' },
    { id: 'g3', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&q=80&auto=format&fit=crop', caption: 'Fresh from the vine' },
    { id: 'g4', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80&auto=format&fit=crop', caption: 'Golden hour over the farmland' },
    { id: 'g5', url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1000&q=80&auto=format&fit=crop', caption: 'Evenings around the fire', size: 'tall' },
    { id: 'g6', url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=900&q=80&auto=format&fit=crop', caption: 'Meeting the animals' },
    { id: 'g7', url: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=900&q=80&auto=format&fit=crop', caption: 'Farm-to-table meals' },
    { id: 'g8', url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80&auto=format&fit=crop', caption: 'From our fields to your fork' },
    { id: 'g9', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1000&q=80&auto=format&fit=crop', caption: 'Soulful evenings in the open', size: 'tall' },
    { id: 'g10', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80&auto=format&fit=crop', caption: 'Where the hills meet the sky' },
    { id: 'g11', url: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=900&q=80&auto=format&fit=crop', caption: 'Village life at dusk' },
    { id: 'g12', url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=80&auto=format&fit=crop', caption: 'Slow mornings, wide fields' },
    { id: 'g13', url: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=1000&q=80&auto=format&fit=crop', caption: 'Handpicked, always fresh', size: 'tall' },
    { id: 'g14', url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=900&q=80&auto=format&fit=crop', caption: 'Trails through the green' },
    { id: 'g15', url: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=900&q=80&auto=format&fit=crop', caption: 'A quiet corner of the farm' },
    { id: 'g16', url: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=900&q=80&auto=format&fit=crop', caption: 'Rows that stretch to the horizon' },
    { id: 'g17', url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=1000&q=80&auto=format&fit=crop', caption: 'Community around the table', size: 'tall' },
    { id: 'g18', url: 'https://images.unsplash.com/photo-1560785496-3c9d27877182?w=900&q=80&auto=format&fit=crop', caption: 'Fresh produce, straight to you' },
    { id: 'g19', url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80&auto=format&fit=crop', caption: 'Tending to the land' },
    { id: 'g20', url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80&auto=format&fit=crop', caption: 'Sunset over the orchard' },
    { id: 'g21', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1000&q=80&auto=format&fit=crop', caption: 'Wide open skies', size: 'tall' },
    { id: 'g22', url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80&auto=format&fit=crop', caption: 'Simple, honest living' },
    { id: 'g23', url: 'https://images.unsplash.com/photo-1444084316824-dc26d6657664?w=900&q=80&auto=format&fit=crop', caption: 'The path back home' },
    { id: 'g24', url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=900&q=80&auto=format&fit=crop', caption: 'Nature, up close' },
    { id: 'g25', url: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1000&q=80&auto=format&fit=crop', caption: 'Mornings that start slow', size: 'tall' },
    { id: 'g26', url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=900&q=80&auto=format&fit=crop', caption: 'Water, earth, and quiet' },
    { id: 'g27', url: 'https://images.unsplash.com/photo-1500336624523-d727130c3328?w=900&q=80&auto=format&fit=crop', caption: 'Growing season' },
    { id: 'g28', url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=80&auto=format&fit=crop', caption: 'A field of gold' },
    { id: 'g29', url: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=1000&q=80&auto=format&fit=crop', caption: 'Together, outdoors', size: 'tall' },
    { id: 'g30', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80&auto=format&fit=crop', caption: 'Quiet focus, fresh air' }
  ];

  // Attractions
  attractions: Attraction[] = [
    { id: '1', title: 'Big, Spacious & Comfortable Stay', icon: 'fa-solid fa-house-chimney' },
    { id: '2', title: 'Organic Practices', icon: 'fa-solid fa-wheat-awn' },
    { id: '3', title: 'Biodiversity-Rich Habitat', icon: 'fa-solid fa-tree' },
    { id: '4', title: 'Near NCR for Easy Access', icon: 'fa-solid fa-location-dot' },
    { id: '5', title: 'Perfect for Long & Short Getaways', icon: 'fa-solid fa-campground' }
  ];

  // Events
  events: Event[] = [
    {
      id: '1',
      slug: 'soulful-study-music',
      title: 'Soulful Study & Music',
      description: 'Safe in the fields — soulful music + farm-fresh salads',
      theme: 'An evening of soul & nature',
      highlights: ['Live Music', 'Farm Fresh Food', 'Peaceful Environment'],
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop'
    },
    {
      id: '2',
      slug: 'dive-summer-vibes',
      title: 'Dive Into Summer Vibes',
      description: 'A futuristic farm filled with summer splashes',
      highlights: ['Mango & Muskmelon Magic', 'Summer Activities', 'Fresh Produce'],
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    },
    {
      id: '3',
      slug: 'youth-on-farm',
      title: 'Youth-On-Farm',
      description: 'Standouts code smart amid nature\'s quiet',
      theme: 'Tech + Nature Retreat',
      highlights: ['Coding Sessions', 'Nature Immersion', 'Networking'],
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop'
    }
  ];

  // Membership types
  membershipTypes: MembershipType[] = [
    {
      id: '1',
      name: 'Sr. Partners',
      description: 'Premium membership with exclusive benefits',
      price: '₹50,000/year'
    },
    {
      id: '2',
      name: 'Partners',
      description: 'Standard partnership membership',
      price: '₹30,000/year'
    },
    {
      id: '3',
      name: '1-Year Members',
      description: 'Annual membership for regular visitors',
      price: '₹15,000/year'
    }
  ];

  properties: Property[] = [];
  loadingProperties = false;

  constructor(private propertyService: PropertyService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.loadingProperties = true;
    console.log('Home: Loading properties...');
    this.propertyService.getAllProperties().subscribe({
      next: (response) => {
        console.log('Home: Properties response:', response);
        this.properties = response.data || [];
        console.log('Home: Properties loaded:', this.properties.length, this.properties);
        this.loadingProperties = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Home: Error loading properties:', err);
        console.error('Home: Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        // Don't show error to user - just show empty state
        this.properties = [];
        this.loadingProperties = false;
        this.cdr.detectChanges();
      }
    });
  }

  onAttractionClick(attraction: Attraction) {
    // Open attraction details in new tab
    console.log('Attraction clicked:', attraction);
    // In real app, navigate to attraction detail page
  }
}
