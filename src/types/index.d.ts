export interface Class {
  id: string;
  startTime: Date;
  endTime: Date;
  programName: string;
  coachName: string;
  coachAvatar?: string;
  maxCapacity: number;
  attendeeCount: number;
  spotsLeft: number;
  isCheckedIn: boolean;
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
  status: string;
  plan?: string;
}
