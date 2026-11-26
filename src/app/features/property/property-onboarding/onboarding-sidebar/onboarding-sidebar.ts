import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface StepInfo {
  index: number;
  title: string;
  description: string;
  completed: boolean;
  accessible: boolean;
}

@Component({
  selector: 'app-onboarding-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './onboarding-sidebar.html',
  styleUrl: './onboarding-sidebar.scss'
})
export class OnboardingSidebar {
  @Input() currentStep: number = 0;
  @Input() steps: StepInfo[] = [];
  @Input() progressPercent: number = 0;
  @Input() hasSavedProgress: boolean = false;
  @Output() stepSelected = new EventEmitter<number>();
  @Output() clearProgress = new EventEmitter<void>();

  goToStep(stepIndex: number) {
    if (this.steps[stepIndex]?.accessible) {
      this.stepSelected.emit(stepIndex);
    }
  }

  onClearProgress() {
    this.clearProgress.emit();
  }
}

