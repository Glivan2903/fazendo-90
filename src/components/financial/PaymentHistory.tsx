
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
import { CalendarRange, Edit, Plus, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import NewPaymentDialog from './NewPaymentDialog';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('current');
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['payments', dateRange],
    queryFn: async () => {
      let startDate, endDate;
      
      if (dateRange === 'current') {
        startDate = new Date();
        startDate.setDate(1);
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else {
        // Add other date range logic here
      }

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
        .gte('due_date', startDate.toISOString())
        .lte('due_date', endDate.toISOString())
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });

  const filteredPayments = payments?.filter(payment => 
    payment.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.subscriptions?.plans?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewPayment = () => {
    setIsNewPaymentOpen(true);
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
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center">
            <CalendarRange className="h-4 w-4 mr-2" />
            {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </Button>
          <Button className="flex items-center" onClick={handleNewPayment}>
            <Plus className="h-4 w-4 mr-2" /> Novo Pagamento
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={dateRange}
              onValueChange={setDateRange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mês Atual</SelectItem>
                <SelectItem value="previous">Mês Anterior</SelectItem>
                <SelectItem value="next">Próximo Mês</SelectItem>
              </SelectContent>
            </Select>
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
              {filteredPayments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.profiles?.name || 'N/A'}</TableCell>
                  <TableCell>{payment.subscriptions?.plans?.name || 'Plano não encontrado'}</TableCell>
                  <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {format(new Date(payment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={payment.status === 'paid' ? 'success' : 'warning'}
                      className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {payment.status === 'paid' ? 'Pago' : 'Pendente'}
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
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewPaymentDialog 
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        onPaymentCreated={refetch}
      />
    </div>
  );
};

export default PaymentHistory;
