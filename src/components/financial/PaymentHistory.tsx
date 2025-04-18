
import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Edit, Plus } from 'lucide-react';
import EditPaymentDialog from './EditPaymentDialog';

interface Payment {
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

const PaymentHistory = () => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: payments, isLoading, refetch } = useQuery({
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
      return data as Payment[];
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

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditDialogOpen(true);
  };

  const handlePaymentUpdated = () => {
    refetch();
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
        <Button className="flex items-center" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Novo Pagamento
        </Button>
      </div>

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
            <TableHead className="text-right">Ações</TableHead>
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
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditPayment(payment)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditPaymentDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        payment={selectedPayment}
        onPaymentUpdated={handlePaymentUpdated}
      />
    </div>
  );
};

export default PaymentHistory;
