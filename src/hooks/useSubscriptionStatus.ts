
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PaymentStatus, SubscriptionStatus } from '@/types';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  plans?: {
    id: string;
    name: string;
    amount: number;
    periodicity: string;
    days_validity: number;
    auto_renewal?: boolean;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  status: PaymentStatus;
  payment_date: string | null;
  due_date: string;
}

export interface SubscriptionWithStatus extends Subscription {
  daysUntilExpiration: number | null;
  isExpired: boolean;
  hasUnpaidPayments: boolean;
  formattedStartDate: string;
  formattedEndDate: string;
  statusColor: string;
}

export const useSubscriptionStatus = (userId?: string) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { data: subscriptionWithPayments, isLoading } = useQuery({
    queryKey: ['user-subscription-status', userId, refreshTrigger],
    queryFn: async () => {
      if (!userId) return null;

      console.log("Fetching subscription status for user:", userId);

      // Get user's active subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            id,
            name,
            amount,
            periodicity,
            days_validity
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (subError) {
        if (subError.code === 'PGRST116') {
          // No subscription found
          console.log("No subscription found for user:", userId);
          return null;
        }
        console.error("Error fetching subscription:", subError);
        throw subError;
      }
      
      if (!subscription) {
        console.log("No subscription data returned for user:", userId);
        return null;
      }
      
      console.log("Fetched subscription:", subscription);
      
      // Get payments for this subscription
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('subscription_id', subscription.id)
        .order('due_date', { ascending: true });
        
      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        throw paymentsError;
      }

      console.log("Fetched payments:", paymentsData);

      // Transform the data to match our types
      const payments = paymentsData ? paymentsData.map(payment => ({
        ...payment,
        status: payment.status as PaymentStatus
      })) : [];
      
      // Ensure subscription status is one of the allowed types
      return {
        ...subscription,
        status: (subscription.status as SubscriptionStatus),
        payments
      };
    },
    enabled: !!userId,
  });
  
  // Check if subscription is expired and update status in database if needed
  useQuery({
    queryKey: ['update-subscription-status', subscriptionWithPayments?.id, refreshTrigger],
    queryFn: async () => {
      if (!subscriptionWithPayments) return null;
      
      const today = new Date();
      const endDate = parseISO(subscriptionWithPayments.end_date);
      const isExpired = isPast(endDate);
      
      if (isExpired && subscriptionWithPayments.status === 'active') {
        console.log("Subscription expired, updating status to expired:", subscriptionWithPayments.id);
        
        // Update subscription status to expired
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('id', subscriptionWithPayments.id);
        
        if (error) {
          console.error("Error updating subscription status:", error);
        } else {
          // Refresh data after updating
          setRefreshTrigger(prev => prev + 1);
        }
      }
      
      return null;
    },
    enabled: !!subscriptionWithPayments?.id,
  });
  
  const processedSubscription = subscriptionWithPayments ? formatSubscription(subscriptionWithPayments) : null;
  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return {
    subscription: processedSubscription,
    isLoading,
    refreshData
  };
};

function formatSubscription(subscription: Subscription): SubscriptionWithStatus {
  const today = new Date();
  const endDate = parseISO(subscription.end_date);
  const isExpired = isPast(endDate);
  
  const daysUntilExpiration = isExpired ? null : differenceInDays(endDate, today);
  
  const hasUnpaidPayments = subscription.payments?.some(
    payment => payment.status === 'pending' || payment.status === 'overdue'
  ) || false;
  
  let statusColor = 'green';
  if (isExpired) {
    statusColor = 'red';
  } else if (hasUnpaidPayments) {
    statusColor = 'amber';
  } else if (daysUntilExpiration !== null && daysUntilExpiration <= 7) {
    statusColor = 'amber';
  }
  
  return {
    ...subscription,
    daysUntilExpiration,
    isExpired,
    hasUnpaidPayments,
    formattedStartDate: format(parseISO(subscription.start_date), 'dd/MM/yyyy', { locale: ptBR }),
    formattedEndDate: format(parseISO(subscription.end_date), 'dd/MM/yyyy', { locale: ptBR }),
    statusColor
  };
}

export const useUserSubscriptions = () => {
  const [filters, setFilters] = useState({
    status: 'all',  // 'all', 'active', 'expired'
    searchTerm: '',
  });

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            id,
            name,
            amount,
            periodicity,
            days_validity
          ),
          profiles (
            name,
            email,
            status
          )
        `);
        
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query.order('end_date', { ascending: true });
      
      if (error) throw error;
      
      // Process and format the subscriptions
      return data.map(sub => {
        const endDate = parseISO(sub.end_date);
        const isExpired = isPast(endDate);
        const daysUntilExpiration = isExpired ? null : differenceInDays(endDate, new Date());
        
        return {
          ...sub,
          isExpired,
          daysUntilExpiration,
          formattedStartDate: format(parseISO(sub.start_date), 'dd/MM/yyyy', { locale: ptBR }),
          formattedEndDate: format(parseISO(sub.end_date), 'dd/MM/yyyy', { locale: ptBR })
        };
      }).filter(sub => {
        if (!filters.searchTerm) return true;
        
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          sub.profiles?.name?.toLowerCase().includes(searchLower) ||
          sub.profiles?.email?.toLowerCase().includes(searchLower) ||
          sub.plans?.name?.toLowerCase().includes(searchLower)
        );
      });
    }
  });
  
  return {
    subscriptions: subscriptions || [],
    isLoading,
    filters,
    setFilters
  };
};
