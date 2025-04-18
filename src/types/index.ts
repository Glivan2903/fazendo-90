
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  status: string;
  phone?: string;
  birth_date?: string;
  created_at?: string;
  plan?: string;
  lastCheckInDate?: string;
  registrationDate?: string;
};

export type Class = {
  // Database properties
  id: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  program_id?: string;
  coach_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Frontend properties
  startTime: Date;
  endTime: Date;
  programName: string;
  coachName: string;
  coachAvatar?: string;
  attendeeCount: number;
  spotsLeft: number;
  isCheckedIn: boolean;
  maxCapacity?: number; // Alias for max_capacity for frontend use
  
  // Optional properties used in some components
  program?: { id: string; name: string };
  coach?: { id: string; name: string; avatar_url?: string };
};

export type ClassDetail = {
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
};

export type Attendee = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'canceled';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';

export type UserCheckin = {
  id: string;
  date: string;
  class_name: string;
  coach_name: string;
  checked_in_at: string;
  status: string;
};

export type FinancialMovement = {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  status: PaymentStatus;
  reference?: string;
};
