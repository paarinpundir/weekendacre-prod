export interface Activity {
  id: string;
  name: string;
  description: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  ageLimit: {
    min: number;
    max?: number;
  };
  price: number;
  duration: number; // in minutes
  category: 'Adventure' | 'Education' | 'Farming' | 'Animal Care';
  videoUrl?: string;
  imageUrl: string;
  available: boolean;
}

export interface ActivityBooking {
  activityId: string;
  date: Date;
  time: string;
  participants: number;
}

