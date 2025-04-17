export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  plan?: string;
  created_at: string;
  phone?: string;
  birth_date?: string;
  weight?: number;
  gender?: string;
  address?: string;
  membership_date?: string;
  avatar_url?: string;
  avatarUrl?: string;
}

export interface Class {
  id: string;
  programName: string;
  startTime: Date;
  endTime: Date;
  coachName: string;
  coachAvatar?: string;
  maxCapacity: number;
  attendeeCount: number;
  spotsLeft: number;
  isCheckedIn: boolean;
  program?: Program;
  coach?: Coach;
  date?: string;
  created_at?: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Coach {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  role?: string;
  created_at?: string;
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

export type { CheckInResult } from './api';
