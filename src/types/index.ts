
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  avatarUrl?: string; // Alternative property name used in some files
  box_id?: string;
  created_at: string;
  phone?: string;  // Added optional phone property
  birth_date?: string;  // Added optional birth_date property
  // Additional properties being used
  plan?: string;
  status?: string;
}
