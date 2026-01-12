import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Activity } from '../../core/models/activity.model';

@Component({
  selector: 'app-activities',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activities.html',
  styleUrl: './activities.scss',
})
export class Activities {
  selectedCategory: string = 'All';
  selectedDifficulty: string = 'All';
  searchTerm: string = '';

  categories = ['All', 'Adventure', 'Education', 'Farming', 'Animal Care'];
  difficulties = ['All', 'Easy', 'Medium', 'Hard', 'Expert'];

  constructor(private dataService: DataService) {}

  get activities() {
    return this.dataService.getActivities()();
  }

  get filteredActivities() {
    return this.activities.filter(activity => {
      const matchesCategory = this.selectedCategory === 'All' || activity.category === this.selectedCategory;
      const matchesDifficulty = this.selectedDifficulty === 'All' || activity.difficultyLevel === this.selectedDifficulty;
      const matchesSearch = this.searchTerm === '' || 
        activity.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }

  selectActivity(activity: Activity) {
    // Navigate to booking with activity pre-selected
    // This would be handled by routing
  }
}
