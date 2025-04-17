
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Search, DollarSign, CreditCard, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: string;
  payment_method: string | null;
  profiles: {
    name: string;
    email: string;
  } | null;
}

const FinancesTab = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('due_date', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      
      // Calcular totais
      const total = data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const pending = data?.reduce((sum, payment) => 
        payment.status === 'pending' ? sum + Number(payment.amount) : sum, 0
      ) || 0;
      
      setTotalRevenue(total);
      setPendingRevenue(pending);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <div className="flex items-center text-green-500">
            <Check className="w-4 h-4 mr-1" />
            Pago
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-500">
            <AlertCircle className="w-4 h-4 mr-1" />
            Pendente
          </div>
        );
      case 'overdue':
        return (
          <div className="flex items-center text-red-500">
            <X className="w-4 h-4 mr-1" />
            Atrasado
          </div>
        );
      default:
        return status;
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <AlertCircle className="h-8 w-8 mb-2 animate-pulse text-blue-500" />
        <p className="text-muted-foreground ml-2">Carregando pagamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {pendingRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data Vencimento</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.profiles?.name || "N/A"}</TableCell>
                  <TableCell>R$ {Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    {format(new Date(payment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {payment.payment_date ? 
                      format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ptBR }) : 
                      "N/A"
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{payment.payment_method || "N/A"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Nenhum pagamento encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FinancesTab;
