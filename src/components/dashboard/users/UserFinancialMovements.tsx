
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar, FileEdit, FilePlus, Eye, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SalesDetailDialog from '@/components/financial/SalesDetailDialog';

interface PaymentMovement {
  id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: string;
  payment_method: string | null;
  reference: string | null;
  bank_invoice_id: string | null;
  notes: string | null;
  bank_invoice?: {
    id: string;
    invoice_number: string;
    buyer_name: string;
    total_amount: number;
    bank_invoice_items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
      item_type: string;
      discount: number;
      period_start?: string;
      period_end?: string;
    }>;
  };
}

interface UserFinancialMovementsProps {
  userId: string | null;
}

const UserFinancialMovements: React.FC<UserFinancialMovementsProps> = ({ userId }) => {
  const [movements, setMovements] = useState<PaymentMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<PaymentMovement | null>(null);
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);

  useEffect(() => {
    fetchMovements();
  }, [userId]);

  const fetchMovements = async () => {
    try {
      if (!userId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bank_invoice:bank_invoices (
            *,
            bank_invoice_items (*)
          )
        `)
        .eq('user_id', userId)
        .order('due_date', { ascending: false });

      if (error) throw error;
      
      console.log("Fetched financial movements:", data);
      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching financial movements:', error);
      toast.error('Erro ao carregar movimentações financeiras');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
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

  const handleOpenSalesDetail = (movement: PaymentMovement) => {
    setSelectedSale(movement);
    setIsSalesDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Movimentações</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Exibir
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Nova movimentação
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
                    // Get the display number - prefer invoice_number if available
                    const displayNumber = movement.bank_invoice?.invoice_number || 
                                         (movement.reference ? movement.reference : movement.id.substring(0, 8));
                    
                    return (
                      <TableRow key={movement.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenSalesDetail(movement)}>
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
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(movement.due_date)}
                          </div>
                        </TableCell>
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
                                handleOpenSalesDetail(movement);
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
        )}
      </CardContent>

      {selectedSale && (
        <SalesDetailDialog 
          open={isSalesDialogOpen}
          onOpenChange={setIsSalesDialogOpen}
          salesData={selectedSale}
        />
      )}
    </Card>
  );
};

export default UserFinancialMovements;
