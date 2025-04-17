
export interface Class {
  id: string;
  name?: string;
  description?: string;
  coach_id?: string;
  start_time?: string;
  end_time?: string;
  program_id?: string;
  date?: string;
  created_at?: string;
  max_capacity?: number;
  
  // For frontend display
  startTime: Date;
  endTime: Date;
  programName: string;
  coachName: string;
  coachAvatar?: string;
  maxCapacity: number;
  attendeeCount: number;
  spotsLeft: number;
  isCheckedIn: boolean;
  program?: {
    id: string;
    name: string;
  };
  coach?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface ClassDetail {
  id: string;
  startTime: Date;
  endTime: Date;
  program: {
    id: string;
    name: string;
  };
  coach: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  maxCapacity: number;
  attendeeCount: number;
}

export interface Attendee {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  box_id?: string;
  plan?: string;
  status?: string;
  phone?: string;
  birth_date?: string;
}

// Add any other existing types here
