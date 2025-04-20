import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { addDays, addMonths, isBefore, parseISO } from 'date-fns';

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_date: string | null;
  due_date: string;
  reference: string | null;
  notes: string | null;
  bank_invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    discount_amount: number;
  } | null;
  formattedAmount: string;
  formattedDueDate: string;
  formattedPaymentDate: string | null;
  profiles?: {
    name?: string;
    email?: string;
    plan?: string;
  };
  subscriptions?: {
    start_date?: string;
    end_date?: string;
    plans?: {
      name?: string;
      periodicity?: string;
    };
  };
}

export const usePaymentHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('current');
  const [statusFilter, setStatusFilter] = useState('all');

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
      } else if (dateRange === 'last3') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setDate(1);
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else if (dateRange === 'all') {
        startDate = null;
        endDate = null;
      } else {
        startDate = new Date();
        startDate.setDate(1);
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      }

      let query = supabase
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
        .order('due_date', { ascending: false });
      
      if (startDate && endDate) {
        query = query
          .gte('due_date', startDate.toISOString())
          .lte('due_date', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const uniquePayments = new Map();
      
      data?.forEach((payment: any) => {
        const userId = payment.user_id;
        const monthYear = new Date(payment.due_date).toISOString().substring(0, 7);
        const key = `${userId}_${monthYear}`;
        
        if (!uniquePayments.has(key) || 
            (payment.status === 'paid') ||
            (uniquePayments.get(key).status !== 'paid' && payment.status === 'pending')) {
          uniquePayments.set(key, payment);
        }
      });
      
      const today = new Date();
      const paymentsWithOverdueStatus = Array.from(uniquePayments.values()).map((payment: any) => {
        if (
          payment.status === 'pending' && 
          payment.due_date && 
          isBefore(parseISO(payment.due_date), today) && 
          !payment.payment_date
        ) {
          return { ...payment, status: 'overdue' };
        }
        return payment;
      });
      
      const processedPayments = paymentsWithOverdueStatus.map((payment: any) => {
        return {
          ...payment,
          formattedAmount: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(payment.amount),
          formattedDueDate: new Date(payment.due_date).toLocaleDateString('pt-BR'),
          formattedPaymentDate: payment.payment_date ? 
            new Date(payment.payment_date).toLocaleDateString('pt-BR') : null
        };
      });
      
      return processedPayments as Payment[];
    },
  });

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.subscriptions?.plans?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return {
    payments: filteredPayments,
    isLoading,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    refetch
  };
};
