
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const useFinancialMetrics = () => {
  const currentDate = new Date();
  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);
  const startOfLastMonth = startOfMonth(subMonths(currentDate, 1));
  const endOfLastMonth = endOfMonth(subMonths(currentDate, 1));

  const { data: metrics } = useQuery({
    queryKey: ['financialMetrics'],
    queryFn: async () => {
      // Active subscriptions
      const { data: currentSubscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('status', 'active')
        .gte('end_date', currentDate.toISOString());

      // Monthly revenue
      const { data: currentMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', startOfCurrentMonth.toISOString())
        .lte('payment_date', endOfCurrentMonth.toISOString());

      const { data: lastMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', startOfLastMonth.toISOString())
        .lte('payment_date', endOfLastMonth.toISOString());

      // Overdue payments
      const { data: overduePayments } = await supabase
        .from('payments')
        .select('id')
        .eq('status', 'pending')
        .lt('due_date', currentDate.toISOString());

      const currentMonthTotal = currentMonthPayments?.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0;
      const lastMonthTotal = lastMonthPayments?.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0;
      const percentChange = lastMonthTotal ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

      return {
        activeSubscriptions: {
          count: currentSubscriptions?.length || 0
        },
        monthlyRevenue: {
          amount: currentMonthTotal,
          percentChange: percentChange.toFixed(1)
        },
        overduePayments: {
          count: overduePayments?.length || 0
        },
        monthlyGrowth: {
          percentage: percentChange.toFixed(1)
        }
      };
    }
  });

  return metrics || {
    activeSubscriptions: { count: 0 },
    monthlyRevenue: { amount: 0, percentChange: 0 },
    overduePayments: { count: 0 },
    monthlyGrowth: { percentage: 0 }
  };
};
