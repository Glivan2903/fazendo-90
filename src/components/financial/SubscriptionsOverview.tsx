import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionsOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      // Get active subscriptions count
      const { count: activeCount, error: activeError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get current month's payments
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: currentMonthPayments, error: currentMonthError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', startOfMonth.toISOString().split('T')[0])
        .lte('payment_date', endOfMonth.toISOString().split('T')[0]);

      if (currentMonthError) throw currentMonthError;

      // Get previous month's payments
      const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      const { data: previousMonthPayments, error: previousMonthError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', startOfPreviousMonth.toISOString().split('T')[0])
        .lte('payment_date', endOfPreviousMonth.toISOString().split('T')[0]);

      if (previousMonthError) throw previousMonthError;

      // Get overdue payments count
      const { count: overdueCount, error: overdueError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'overdue'])
        .lt('due_date', new Date().toISOString().split('T')[0]);

      if (overdueError) throw overdueError;

      // Calculate monthly revenue
      const currentMonthTotal = currentMonthPayments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      const previousMonthTotal = previousMonthPayments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      
      // Calculate growth percentage
      let growth = 0;
      if (previousMonthTotal > 0) {
        growth = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      }

      return {
        activeSubscriptions: activeCount || 0,
        monthlyRevenue: currentMonthTotal,
        overduePayments: overdueCount || 0,
        monthlyGrowth: growth
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Assinaturas Ativas</span>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">{stats?.activeSubscriptions || 0}</h2>
              <p className="text-xs text-gray-500">alunos ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Receita Mensal</span>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                R$ {stats?.monthlyRevenue.toFixed(2) || '0.00'}
              </h2>
              <p className="text-xs text-gray-500">
                {stats?.monthlyGrowth > 0 ? '+' : ''}{stats?.monthlyGrowth.toFixed(1)}% em relação ao mês anterior
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Pagamentos Atrasados</span>
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">{stats?.overduePayments || 0}</h2>
              <p className="text-xs text-gray-500">pagamentos pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Crescimento Mensal</span>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                {stats?.monthlyGrowth > 0 ? '+' : ''}{stats?.monthlyGrowth.toFixed(1)}%
              </h2>
              <p className="text-xs text-gray-500">em relação ao mês anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsOverview;
