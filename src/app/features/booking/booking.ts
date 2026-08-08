import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Booking as BookingModel, Room } from '../../core/models/booking.model';
import { Activity } from '../../core/models/activity.model';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class BookingComponent implements OnInit {
  bookingType: 'Day Visit' | 'Room Stay' | 'Activity' = 'Day Visit';
  selectedDate: string = '';
  selectedEndDate: string = '';
  selectedActivity: string = '';
  selectedRoom: string = '';
  participants: number = 1;
  
  get activities() {
    return this.dataService.getActivities()();
  }

  get rooms() {
    return this.dataService.getRooms()();
  }

  get bookings() {
    return this.dataService.getBookings()();
  }
  
  showCalendar: boolean = false;
  selectedMonth: Date = new Date();
  
  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    // Check if activity is pre-selected from query params
    this.route.queryParams.subscribe(params => {
      if (params['activity']) {
        this.bookingType = 'Activity';
        this.selectedActivity = params['activity'];
      }
    });
  }

  get selectedActivityData(): Activity | undefined {
    return this.activities.find(a => a.id === this.selectedActivity);
  }

  get selectedRoomData(): Room | undefined {
    return this.rooms.find(r => r.id === this.selectedRoom);
  }

  get totalAmount(): number {
    if (this.bookingType === 'Activity' && this.selectedActivityData) {
      return this.selectedActivityData.price * this.participants;
    } else if (this.bookingType === 'Room Stay' && this.selectedRoomData) {
      const days = this.selectedDate && this.selectedEndDate 
        ? Math.ceil((new Date(this.selectedEndDate).getTime() - new Date(this.selectedDate).getTime()) / (1000 * 60 * 60 * 24))
        : 1;
      return this.selectedRoomData.price * days;
    } else if (this.bookingType === 'Day Visit') {
      return 200 * this.participants; // Base day visit price
    }
    return 0;
  }

  isDateAvailable(date: Date): boolean {
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    // Check against existing bookings
    const dateStr = date.toISOString().split('T')[0];
    return !this.bookings.some(b => {
      const bookingDate = new Date(b.date).toISOString().split('T')[0];
      return bookingDate === dateStr && b.status !== 'Cancelled';
    });
  }

  getCalendarDays(): Date[] {
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill first week
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to fill last week
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  }

  selectDate(date: Date) {
    if (this.isDateAvailable(date)) {
      this.selectedDate = date.toISOString().split('T')[0];
      this.showCalendar = false;
    }
  }

  submitBooking() {
    if (!this.authService.isLoggedIn()) {
      alert('Please login to make a booking');
      this.router.navigate(['/dashboard']);
      return;
    }

    if (!this.selectedDate) {
      alert('Please select a date');
      return;
    }

    const user = this.authService.getStoredUser();
    if (!user) return;

    const newBooking: BookingModel = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      type: this.bookingType,
      date: new Date(this.selectedDate),
      endDate: this.selectedEndDate ? new Date(this.selectedEndDate) : undefined,
      status: 'Pending',
      activityId: this.selectedActivity || undefined,
      participants: this.participants,
      roomType: this.selectedRoomData?.type,
      totalAmount: this.totalAmount,
      createdAt: new Date()
    };

    this.dataService.addBooking(newBooking);
    alert('Booking submitted successfully!');
    this.router.navigate(['/dashboard']);
  }

  previousMonth() {
    this.selectedMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() - 1, 1);
  }

  nextMonth() {
    this.selectedMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 1);
  }

  decreaseParticipants() {
    this.participants = Math.max(1, this.participants - 1);
  }

  increaseParticipants() {
    this.participants++;
  }
}