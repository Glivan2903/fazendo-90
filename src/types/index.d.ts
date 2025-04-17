
export interface Class {
  id: string;
  name?: string;
  description?: string;
  coach_id?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  max_capacity?: number;
  created_at?: string;
  updated_at?: string;
  users?: User[];
  coach?: User;
  // Additional properties being used in the codebase
  startTime: Date;
  endTime: Date;
  programName: string;
  coachName: string;
  coachAvatar?: string;
  maxCapacity: number;
  attendeeCount: number;
  spotsLeft: number;
  isCheckedIn: boolean;
  program?: Program;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  avatarUrl?: string; // Alternative property name used in some files
  box_id?: string;
  created_at: string;
  phone?: string;
  birth_date?: string;
  // Additional properties being used
  plan?: string;
  status?: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  color?: string;
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
