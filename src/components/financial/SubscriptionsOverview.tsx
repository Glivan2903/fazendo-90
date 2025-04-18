
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

const SubscriptionsOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      // Get active subscriptions
      const { data: activeSubscriptions, error: activeError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('status', 'active');

      // Get overdue subscriptions
      const { data: overdueSubscriptions, error: overdueError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('status', 'overdue');

      if (activeError || overdueError) throw activeError || overdueError;

      return {
        active: activeSubscriptions?.length || 0,
        overdue: overdueSubscriptions?.length || 0,
      };
    },
  });

  if (isLoading) {
    return <div>Carregando estatísticas...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Ativas</CardTitle>
          <CardDescription>Total de alunos ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.active}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Atrasados</CardTitle>
          <CardDescription>Alunos com pagamento pendente</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-500">{stats?.overdue}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total de Receita</CardTitle>
          <CardDescription>Valor mensal recorrente</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-500">
            R$ {((stats?.active || 0) * 100).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsOverview;
