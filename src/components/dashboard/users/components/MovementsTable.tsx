
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileEdit, Eye, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MovementsTableProps {
  movements: any[];
  onSaleClick: (movement: any) => void;
  formatCurrency: (value: number) => string;
}

export const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  onSaleClick,
  formatCurrency
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getPaymentMethodText = (method: string | null) => {
    if (!method) return 'Dinheiro';
    
    switch (method.toLowerCase()) {
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'cash': return 'Dinheiro';
      case 'bank_transfer': return 'Transferência';
      case 'pix': return 'PIX';
      default: return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">RECEBIDO</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">PENDENTE</Badge>;
      case 'overdue':
        return <Badge variant="destructive">VENCIDO</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800">CANCELADO</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const getMovementTypeIcon = (movement: any) => {
    if (movement.bank_invoice) {
      return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        Venda
      </Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Mensalidade
      </Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {movements.length === 0 ? (
        <div className="border rounded-md p-6 text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <h3 className="text-lg font-medium">Nenhuma movimentação encontrada</h3>
          <p className="text-sm">Este aluno ainda não possui movimentações financeiras registradas.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => {
                const displayNumber = movement.bank_invoice?.invoice_number 
                  ? `#${movement.bank_invoice.invoice_number.padStart(4, '0')}`
                  : `#${movement.id.substring(0, 8)}`;
                
                return (
                  <TableRow key={movement.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onSaleClick(movement)}>
                    <TableCell>{displayNumber}</TableCell>
                    <TableCell>{getMovementTypeIcon(movement)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {movement.notes || 
                       (movement.bank_invoice ? `Venda - ${movement.bank_invoice.invoice_number}` : 'Pagamento')}
                    </TableCell>
                    <TableCell>{formatDate(movement.due_date)}</TableCell>
                    <TableCell>
                      {movement.payment_date ? formatDate(movement.payment_date) : '--/--/----'}
                    </TableCell>
                    <TableCell>{getPaymentMethodText(movement.payment_method)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(movement.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(movement.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaleClick(movement);
                          }}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
