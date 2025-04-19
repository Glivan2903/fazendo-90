
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
    phone?: string;
    birth_date?: string;
    created_at?: string;
    plan?: string;
    subscription_id?: string;
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

  plans: {
    id: string;
    name: string;
    description?: string;
    amount: number;
    periodicity: string;
    active?: boolean;
    auto_renewal?: boolean;
    days_validity?: number;
    created_at?: string;
    updated_at?: string;
  };

  subscriptions: {
    id: string;
    user_id: string;
    plan_id?: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    plans?: {
      id: string;
      name: string;
      periodicity: string;
      auto_renewal?: boolean;
    };
  };

  payments: {
    id: string;
    user_id: string;
    subscription_id?: string;
    amount: number;
    status: string;
    payment_date?: string;
    due_date: string;
    payment_method?: string;
    reference?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    profiles?: {
      name: string;
      email: string;
      plan?: string;
    };
    subscriptions?: {
      start_date: string;
      end_date: string;
      plans?: {
        name: string;
        periodicity: string;
      };
    };
  };
  
  suppliers: {
    id: string;
    name: string;
    active?: boolean;
    created_at?: string;
  };
  
  bank_invoices: {
    id: string;
    user_id: string;
    invoice_number: string;
    due_date: string;
    payment_date?: string;
    total_amount: number;
    discount_amount: number;
    status: string;
    payment_method?: string;
    sale_date: string;
    buyer_name: string;
    seller_name: string;
    created_at?: string;
    updated_at?: string;
    category?: string;
    fornecedor?: string;
    bank_account?: string;
    transaction_type?: string;
  };
};
