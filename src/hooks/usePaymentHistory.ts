
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  payment_date: string | null;
  due_date: string;
  status: string;
  payment_method: string | null;
  notes: string | null;
  profiles?: {
    name: string;
    email: string;
    plan: string | null;
  };
  subscriptions?: {
    start_date: string;
    end_date: string;
    plans: {
      name: string;
      periodicity: string;
    };
  };
}

export const usePaymentHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('current');

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['payments', dateRange],
    queryFn: async () => {
      let startDate, endDate;
      
      if (dateRange === 'current') {
        startDate = new Date();
        startDate.setDate(1);
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else if (dateRange === 'previous') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate = new Date();
        endDate.setDate(0);
      } else if (dateRange === 'next') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1);
        startDate.setDate(1);
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2);
        endDate.setDate(0);
      } else {
        startDate = new Date();
        startDate.setDate(1);
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles (
            name,
            email,
            plan
          ),
          subscriptions (
            start_date,
            end_date,
            plans (
              name,
              periodicity
            )
          )
        `)
        .gte('due_date', startDate.toISOString())
        .lte('due_date', endDate.toISOString())
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });

  const filteredPayments = payments?.filter(payment => 
    payment.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.profiles?.plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.subscriptions?.plans?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    payments: filteredPayments,
    isLoading,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    refetch
  };
};
