
// Custom database type definitions to supplement the auto-generated types
// These will be manually maintained but help with TypeScript errors

export type Tables = {
  classes: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    max_capacity: number;
    program_id: string;
    coach_id: string;
    created_at?: string;
    updated_at?: string;
    programs?: {
      id: string;
      name: string;
      description?: string;
    };
    profiles?: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    checkins?: Array<{
      id: string;
      user_id: string;
      status: string;
      checked_in_at?: string;
      profiles?: {
        id: string;
        name: string;
        avatar_url?: string;
      };
    }>;
  };

  profiles: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    role: string;
    status: string;
    plan?: string;
    phone?: string;
    birth_date?: string;
    created_at?: string;
  };

  programs: {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };

  checkins: {
    id: string;
    class_id: string;
    user_id: string;
    status: string;
    checked_in_at?: string;
    profiles?: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    classes?: {
      id: string;
      date: string;
      start_time: string;
      end_time: string;
      program_id: string;
    };
  };

  payments: {
    id: string;
    subscription_id: string;
    user_id: string;
    amount: number;
    status: string;
    payment_method?: string;
    due_date: string;
    payment_date?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    profiles?: {
      id: string;
      name: string;
      email: string;
      plan?: string;
    };
  };

  subscriptions: {
    id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    created_at?: string;
    profiles?: {
      id: string;
      name: string;
      email: string;
      plan?: string;
    };
    payments?: Array<{
      id: string;
      status: string;
    }>;
  };
};
