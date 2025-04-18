
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp 
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionsOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      // Get active subscriptions count
      const { count: activeCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total revenue from active subscriptions
      const { data: revenue } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      // Get overdue payments count
      const { count: overdueCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

      // Calculate monthly growth
      const { data: lastMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('payment_date', new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString())
        .lt('payment_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      const currentMonthTotal = revenue?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      const lastMonthTotal = lastMonthPayments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      const growth = lastMonthTotal ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">alunos ativos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {stats?.monthlyRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats?.monthlyGrowth > 0 ? '+' : ''}{stats?.monthlyGrowth.toFixed(1)}% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Atrasados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.overduePayments}</div>
          <p className="text-xs text-muted-foreground">pagamentos pendentes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.monthlyGrowth > 0 ? '+' : ''}{stats?.monthlyGrowth.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">em relação ao mês anterior</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsOverview;
