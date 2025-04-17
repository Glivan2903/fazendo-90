export interface Class {
  id: string;
  name: string;
  description: string;
  coach_id: string;
  start_time: string;
  end_time: string;
  date: string;
  max_capacity: number;
  created_at: string;
  updated_at: string;
  users?: User[];
  coach?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  box_id?: string;
  created_at: string;
  phone?: string;
  birth_date?: string;
}
