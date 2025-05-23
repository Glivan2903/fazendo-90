
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment } from '@/hooks/usePaymentHistory';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EditPaymentDialog from './EditPaymentDialog';
import { Checkbox } from '@/components/ui/checkbox';

interface PaymentTableProps {
  payments: Payment[] | undefined;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({ payments }) => {
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'RECEBIDO';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handlePaymentDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Pagamento excluído com sucesso');
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast.error('Erro ao excluir pagamento');
    }
  };

  const handlePaymentUpdate = async (payment: Payment) => {
    try {
      // If the payment status is changing to 'paid', update the subscription status as well
      if (payment.status === 'paid' && payment.payment_date && payment.subscription_id) {
        // First, update the payment
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: payment.status,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            notes: payment.notes
          })
          .eq('id', payment.id);

        if (paymentError) throw paymentError;

        // Then, check if we should update the subscription status to active
        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', payment.subscription_id)
          .single();

        if (subscriptionError) throw subscriptionError;

        // Only update subscription if it's expired or cancelled
        if (subscription && (subscription.status === 'expired' || subscription.status === 'cancelled')) {
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active'
            })
            .eq('id', payment.subscription_id);

          if (updateError) throw updateError;
          
          toast.success('Assinatura reativada após confirmação do pagamento');
        }
      } else {
        // Just update the payment
        const { error } = await supabase
          .from('payments')
          .update({
            status: payment.status,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            notes: payment.notes
          })
          .eq('id', payment.id);

        if (error) throw error;
      }
      
      toast.success('Pagamento atualizado com sucesso');
      setIsDialogOpen(false);
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error('Erro ao atualizar pagamento');
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead>Data vencto</TableHead>
              <TableHead>Forma pagto</TableHead>
              <TableHead>Venda</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Desc Parcela</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments && payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="w-[40px]">
                    <Checkbox />
                  </TableCell>
                  <TableCell>{formatDate(payment.due_date)}</TableCell>
                  <TableCell>{payment.payment_method || 'Dinheiro'}</TableCell>
                  <TableCell className="text-blue-600">{payment.reference || '-'}</TableCell>
                  <TableCell>Vendas</TableCell>
                  <TableCell className="font-medium">{payment.profiles?.name || '-'}</TableCell>
                  <TableCell>0,00</TableCell>
                  <TableCell>0,00</TableCell>
                  <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={payment.status === 'paid' ? 'bg-green-500 text-white' : getPaymentStatusColor(payment.status)}
                    >
                      {getPaymentStatusText(payment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingPayment(payment);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditPaymentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        payment={editingPayment}
        onPaymentUpdated={handlePaymentUpdate}
      />
    </div>
  );
};
