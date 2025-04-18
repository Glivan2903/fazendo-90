
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

interface PaymentMovement {
  id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: string;
  payment_method: string | null;
  reference: string | null;
  description?: string;
  observation?: string;
  valor_bruto?: number;
  valor_taxa?: number;
  valor_liquido?: number;
}

interface UserFinancialMovementsProps {
  userId: string | null;
}

const UserFinancialMovements: React.FC<UserFinancialMovementsProps> = ({ userId }) => {
  const [movements, setMovements] = useState<PaymentMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [userId]);

  const fetchMovements = async () => {
    try {
      if (!userId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: false });

      if (error) throw error;
      
      // Transformar os dados para o formato esperado pelo componente
      const transformedData = data?.map(payment => ({
        ...payment,
        valor_bruto: payment.amount,
        valor_taxa: 0, // Não temos essa informação no banco, então vamos assumir 0
        valor_liquido: payment.amount, // Sem taxa, o líquido é igual ao bruto
        description: payment.reference || `Pagamento ${payment.id.substring(0, 8)}`
      }));
      
      setMovements(transformedData || []);
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
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </TableCell>
                      <TableCell>{movement.id.substring(0, 8)}</TableCell>
                      <TableCell>{movement.payment_method || 'Dinheiro'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {movement.reference || '1234'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 rounded-full">
                          Vendas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(movement.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(movement.valor_bruto || 0)}</TableCell>
                      <TableCell>{formatCurrency(movement.valor_taxa || 0)}</TableCell>
                      <TableCell>{formatCurrency(0)}</TableCell>
                      <TableCell>{formatCurrency(movement.valor_liquido || 0)}</TableCell>
                      <TableCell>{getStatusBadge(movement.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
    </Card>
  );
};

export default UserFinancialMovements;
