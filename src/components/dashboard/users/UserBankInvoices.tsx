
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';

interface BankInvoice {
  id: string;
  invoice_number: string;
  due_date: string;
  status: string;
  payment_method: string | null;
  total_amount: number;
  payment_date: string | null;
  reference: string | null;
  buyer_name: string;
}

interface UserBankInvoicesProps {
  userId: string | null;
}

const UserBankInvoices: React.FC<UserBankInvoicesProps> = ({ userId }) => {
  const [invoices, setInvoices] = useState<BankInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [userId]);

  const fetchInvoices = async () => {
    try {
      if (!userId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('bank_invoices')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: false });

      if (error) throw error;
      
      // Map the data to match the BankInvoice interface
      const mappedInvoices: BankInvoice[] = (data || []).map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        due_date: invoice.due_date,
        status: invoice.status,
        payment_method: invoice.payment_method,
        total_amount: invoice.total_amount,
        payment_date: invoice.payment_date,
        reference: null, // Add a default null reference
        buyer_name: invoice.buyer_name
      }));

      setInvoices(mappedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Erro ao carregar faturas do usuário');
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

  const formatDate = (dateString: string) => {
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
        <CardTitle className="text-xl font-bold">Faturas</CardTitle>
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
                  <TableHead>Fatura</TableHead>
                  <TableHead>Data de vencimento</TableHead>
                  <TableHead>Forma de pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {invoice.invoice_number ? 
                          `Fatura #${invoice.invoice_number.padStart(4, '0')}` : 
                          `Fatura ${invoice.id.substring(0, 8)}`
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(invoice.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>{invoice.payment_method || 'Não especificado'}</TableCell>
                      <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Nenhuma fatura encontrada
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

export default UserBankInvoices;
