
import { format, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Payment } from '@/hooks/usePaymentHistory';
import { Edit, FileText } from 'lucide-react';

interface PaymentTableProps {
  payments?: Payment[];
}

export const PaymentTable = ({ payments = [] }: PaymentTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderStatus = (payment: Payment) => {
    if (payment.status === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-800">
          Pago
        </Badge>
      );
    } else if (payment.status === 'overdue') {
      return (
        <Badge className="bg-red-100 text-red-800">
          Atrasado
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-800">
          Pendente
        </Badge>
      );
    }
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum pagamento encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">
                {payment.profiles?.name || "Cliente não encontrado"}
              </TableCell>
              <TableCell>
                {payment.profiles?.plan || payment.subscriptions?.plans?.name || "Plano não definido"}
              </TableCell>
              <TableCell>
                {payment.due_date ? format(new Date(payment.due_date), 'dd/MM/yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>
                {payment.payment_date 
                  ? format(new Date(payment.payment_date), 'dd/MM/yyyy') 
                  : '-'}
              </TableCell>
              <TableCell>
                {renderStatus(payment)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
