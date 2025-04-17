
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

export interface Attendee {
  id: string;
  name: string;
  avatarUrl?: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  plan?: string;
  status: string;
  phone?: string;
  birth_date?: string;
}
