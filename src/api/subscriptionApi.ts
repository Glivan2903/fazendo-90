
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "date-fns";

export interface Subscription {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  profiles?: {
    name: string;
    email: string;
    plan?: string;
  } | null;
}

export const fetchSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        profiles:user_id (
          name,
          email,
          plan
        )
      `)
      .order('end_date', { ascending: true });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Exception in fetchSubscriptions:", error);
    return []; // Return an empty array instead of throwing
  }
};

export const createSubscription = async (userId: string, startDate?: Date) => {
  try {
    const start = startDate || new Date();
    let end;
    
    // Get user's plan to determine subscription length
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user plan:", userError);
      throw userError;
    }
    
    // Set end date based on plan
    switch (userData?.plan) {
      case 'Trimestral':
        end = addDays(start, 90); // 3 months
        break;
      case 'Anual':
        end = addDays(start, 365); // 12 months
        break;
      default: // Mensal
        end = addDays(start, 30); // 1 month
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0]
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
    
    // Create initial payment record
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            subscription_id: data.id,
            user_id: userId,
            amount: getAmountByPlan(userData?.plan || 'Mensal'),
            status: 'paid',
            payment_method: 'pix',
            due_date: end.toISOString().split('T')[0],
            payment_date: new Date().toISOString().split('T')[0]
          }
        ]);
        
      if (paymentError) {
        console.error("Error creating payment:", paymentError);
      }
      
      // Update user status to active
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'Ativo' })
        .eq('id', userId);
        
      if (profileError) {
        console.error("Error updating profile status:", profileError);
      }
    } catch (paymentError) {
      console.error("Exception in creating payment:", paymentError);
    }

    return data;
  } catch (error) {
    console.error("Exception in createSubscription:", error);
    throw error;
  }
};

export const renewSubscription = async (userId: string) => {
  try {
    const start = new Date();
    let end;
    
    // Get user's plan to determine subscription length
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user plan:", userError);
      throw userError;
    }
    
    // Set end date based on plan
    switch (userData?.plan) {
      case 'Trimestral':
        end = addDays(start, 90); // 3 months
        break;
      case 'Anual':
        end = addDays(start, 365); // 12 months
        break;
      default: // Mensal
        end = addDays(start, 30); // 1 month
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0]
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error renewing subscription:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Exception in renewSubscription:", error);
    throw error;
  }
};

// Helper function to get amount based on plan
const getAmountByPlan = (plan: string): number => {
  switch (plan) {
    case 'Trimestral':
      return 270.00;
    case 'Anual':
      return 960.00;
    default: // Mensal
      return 100.00;
  }
};
