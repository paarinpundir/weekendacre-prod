import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-education',
  imports: [CommonModule, RouterLink],
  templateUrl: './education.html',
  styleUrl: './education.scss',
})
export class Education {
  educationSections = [
    {
      id: '1',
      title: 'Animal Care Videos',
      description: 'Learn how to care for farm animals',
      icon: 'fa-solid fa-cow',
      videos: [
        { title: 'Feeding Farm Animals', duration: '5:30' },
        { title: 'Animal Health Basics', duration: '8:15' },
        { title: 'Dairy Farm Management', duration: '12:00' }
      ]
    },
    {
      id: '2',
      title: 'Farming Tips',
      description: 'Sustainable farming techniques and best practices',
      icon: 'fa-solid fa-wheat-awn',
      articles: [
        { title: 'Organic Composting', readTime: '5 min read' },
        { title: 'Crop Rotation Methods', readTime: '7 min read' },
        { title: 'Natural Pest Control', readTime: '6 min read' }
      ]
    },
    {
      id: '3',
      title: 'Hydroponics Section',
      description: 'Modern soilless farming technology',
      icon: 'fa-solid fa-seedling',
      content: [
        { title: 'Introduction to Hydroponics', type: 'video' },
        { title: 'Setting Up Your System', type: 'article' },
        { title: 'Nutrient Management', type: 'video' }
      ]
    },
    {
      id: '4',
      title: 'Sustainability Blog',
      description: 'Latest articles on sustainable living',
      icon: 'fa-solid fa-recycle',
      posts: [
        { title: 'Reducing Carbon Footprint', date: '2024-01-15', author: 'Eco Team' },
        { title: 'Water Conservation Tips', date: '2024-01-10', author: 'Eco Team' },
        { title: 'Renewable Energy at Home', date: '2024-01-05', author: 'Eco Team' }
      ]
    }
  ];
}