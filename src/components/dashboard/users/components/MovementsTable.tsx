
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileEdit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center"></TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Forma pagto</TableHead>
            <TableHead>Venda</TableHead>
            <TableHead>Observação</TableHead>
            <TableHead>Data de vencimento</TableHead>
            <TableHead>Valor bruto</TableHead>
            <TableHead>Valor da taxa</TableHead>
            <TableHead>Desc Parcela</TableHead>
            <TableHead>Valor líquido</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length > 0 ? (
            movements.map((movement) => {
              const displayNumber = movement.bank_invoice?.invoice_number || 
                                   (movement.reference ? movement.reference : movement.id.substring(0, 8));
              
              return (
                <TableRow key={movement.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onSaleClick(movement)}>
                  <TableCell className="text-center">
                    <input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} />
                  </TableCell>
                  <TableCell>{displayNumber}</TableCell>
                  <TableCell>{getPaymentMethodText(movement.payment_method)}</TableCell>
                  <TableCell>
                    {movement.bank_invoice?.invoice_number ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {movement.bank_invoice.invoice_number}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800 rounded-full">
                      {movement.bank_invoice ? 'Venda' : 'Pagamento'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(movement.due_date)}</TableCell>
                  <TableCell>{formatCurrency(movement.bank_invoice?.total_amount || movement.amount)}</TableCell>
                  <TableCell>{formatCurrency(0)}</TableCell>
                  <TableCell>{formatCurrency(0)}</TableCell>
                  <TableCell>{formatCurrency(movement.amount)}</TableCell>
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
            })
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-6">
                Nenhuma movimentação encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
