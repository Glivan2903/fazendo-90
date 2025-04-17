
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
          email
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
    const end = addDays(start, 30);

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

    return data;
  } catch (error) {
    console.error("Exception in createSubscription:", error);
    throw error;
  }
};

export const renewSubscription = async (userId: string) => {
  try {
    const start = new Date();
    const end = addDays(start, 30);

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
