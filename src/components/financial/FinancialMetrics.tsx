
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';

export const FinancialMetrics = () => {
  const { 
    activeSubscriptions,
    monthlyRevenue,
    overduePayments,
    monthlyGrowth
  } = useFinancialMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold">{activeSubscriptions.count}</p>
              <p className="text-sm text-muted-foreground">alunos ativos</p>
            </div>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold">
                R$ {monthlyRevenue.amount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {monthlyRevenue.percentChange}% em relação ao mês anterior
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold">{overduePayments.count}</p>
              <p className="text-sm text-muted-foreground">pagamentos pendentes</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold">{monthlyGrowth.percentage}%</p>
              <p className="text-sm text-muted-foreground">em relação ao mês anterior</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
