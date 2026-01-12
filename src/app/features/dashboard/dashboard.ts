import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Booking as BookingModel } from '../../core/models/booking.model';
import { Review } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  isLoggedIn = false;
  userBookings: BookingModel[] = [];
  showLoginForm = true;
  loginEmail = '';
  loginPassword = '';
  showReviewForm = false;
  reviewRating = 5;
  reviewComment = '';
  reviewType: 'Activity' | 'Overall' | 'Accommodation' = 'Overall';

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadUserBookings();
      this.showLoginForm = false;
    }
  }

  login() {
    if (this.authService.login(this.loginEmail, this.loginPassword)) {
      this.isLoggedIn = true;
      this.showLoginForm = false;
      this.loadUserBookings();
    } else {
      alert('Invalid credentials');
    }
  }

  loadUserBookings() {
    const user = this.authService.getStoredUser();
    if (user) {
      const allBookings = this.dataService.getBookings()();
      this.userBookings = allBookings.filter(b => b.userId === user.id);
    }
  }

  cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.dataService.updateBooking(bookingId, { status: 'Cancelled' });
      this.loadUserBookings();
    }
  }

  submitReview() {
    const user = this.authService.getStoredUser();
    if (!user) return;

    const review: Review = {
      id: `review-${Date.now()}`,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      rating: this.reviewRating,
      comment: this.reviewComment,
      date: new Date(),
      type: this.reviewType
    };

    this.dataService.addReview(review);
    alert('Thank you for your review!');
    this.showReviewForm = false;
    this.reviewComment = '';
    this.reviewRating = 5;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'status-confirmed';
      case 'Pending': return 'status-pending';
      case 'Cancelled': return 'status-cancelled';
      case 'Completed': return 'status-completed';
      default: return '';
    }
  }
}
