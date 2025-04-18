
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PaymentHistory = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles (
            name,
            email
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

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Período</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.profiles?.name || 'N/A'}</TableCell>
              <TableCell>{payment.subscriptions?.plans?.name || 'Plano não encontrado'}</TableCell>
              <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                {format(new Date(payment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusBadgeStyle(payment.status)}>
                  {payment.status === 'paid'
                    ? 'Pago'
                    : payment.status === 'pending'
                    ? 'Pendente'
                    : 'Atrasado'}
                </Badge>
              </TableCell>
              <TableCell>{payment.payment_method || '-'}</TableCell>
              <TableCell>
                {payment.subscriptions?.plans?.periodicity || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentHistory;
