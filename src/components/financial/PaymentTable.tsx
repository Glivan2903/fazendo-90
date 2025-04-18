
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Payment } from '@/hooks/usePaymentHistory';

interface PaymentTableProps {
  payments: Payment[] | undefined;
}

export const PaymentTable = ({ payments }: PaymentTableProps) => {
  return (
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
        {!payments || payments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
              Nenhum pagamento encontrado para o período selecionado
            </TableCell>
          </TableRow>
        ) : (
          payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.profiles?.name || 'N/A'}</TableCell>
              <TableCell>
                {payment.profiles?.plan || payment.subscriptions?.plans?.name || 'Plano não encontrado'}
              </TableCell>
              <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                {format(new Date(payment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={payment.status === 'paid' ? 'default' : 'outline'}
                  className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                </Badge>
              </TableCell>
              <TableCell>
                {payment.payment_method === 'cash' && 'Dinheiro'}
                {payment.payment_method === 'credit_card' && 'Cartão de Crédito'}
                {payment.payment_method === 'debit_card' && 'Cartão de Débito'}
                {payment.payment_method === 'pix' && 'PIX'}
                {!payment.payment_method && '-'}
              </TableCell>
              <TableCell>
                {payment.subscriptions?.plans?.periodicity || '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
