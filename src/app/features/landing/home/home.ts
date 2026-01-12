import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DualCarousel, CarouselSlide } from '../dual-carousel/dual-carousel';
import { ExperienceCards, ExperienceCard } from '../experience-cards/experience-cards';
import { MembershipSection } from '../membership-section/membership-section';
import { AttractionsSection, Attraction } from '../attractions-section/attractions-section';
import { EventsSection, Event } from '../events-section/events-section';
import { MembershipRegistration, MembershipType } from '../membership-registration/membership-registration';
import { ContactSection } from '../contact-section/contact-section';
import { PropertyCard } from '../../property/property-card/property-card';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';

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
    PropertyCard
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
      subtext: 'Where your weekends slow down, and village life welcomes you home',
      backgroundColor: '#e8f5e9',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop'
    },
    {
      id: '2',
      title: 'From Our Fields to Your Fork',
      subtext: 'Farm-fresh food on your visit. Farm-bag freshness to your home — Taste of nature.',
      backgroundColor: '#f5f7fa',
      imageUrl: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1920&h=1080&fit=crop'
    }
  ];

  // Experience cards - 4 horizontal cards
  experienceCards: ExperienceCard[] = [
    {
      id: '1',
      title: 'Escape for a Day',
      description: 'Picnic under open skies',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800'
    },
    {
      id: '2',
      title: 'Camps in the Estate',
      description: 'Come together, live the outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
    },
    {
      id: '3',
      title: 'Make Your Home',
      description: 'Shared spaces. Shared growth. Shared living.',
      imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800'
    },
    {
      id: '4',
      title: 'Scenic Farm Days to Spiritual Getaways',
      description: 'Haridwar & Rishikesh await',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    }
  ];

  // Attractions
  attractions: Attraction[] = [
    { id: '1', title: 'Big, Spacious & Comfortable Stay', icon: '🏠' },
    { id: '2', title: 'Organic Practices', icon: '🌾' },
    { id: '3', title: 'Biodiversity-Rich Habitat', icon: '🦋' },
    { id: '4', title: 'Near NCR for Easy Access', icon: '📍' },
    { id: '5', title: 'Perfect for Long & Short Getaways', icon: '⛺' }
  ];

  // Events
  events: Event[] = [
    {
      id: '1',
      title: 'Soulful Study & Music',
      description: 'Safe in the fields — soulful music + farm-fresh salads',
      theme: 'An evening of soul & nature',
      highlights: ['Live Music', 'Farm Fresh Food', 'Peaceful Environment'],
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop'
    },
    {
      id: '2',
      title: 'Dive Into Summer Vibes',
      description: 'A futuristic farm filled with summer splashes',
      highlights: ['Mango & Muskmelon Magic', 'Summer Activities', 'Fresh Produce'],
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    },
    {
      id: '3',
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

  constructor(private propertyService: PropertyService) {}

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
      }
    });
  }

  onAttractionClick(attraction: Attraction) {
    // Open attraction details in new tab
    console.log('Attraction clicked:', attraction);
    // In real app, navigate to attraction detail page
  }
}
