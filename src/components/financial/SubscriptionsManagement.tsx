
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  CalendarX,
  AlertCircle,
  Search,
  RefreshCcw,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSubscriptions } from "@/hooks/useSubscriptionStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const SubscriptionsManagement = () => {
  const queryClient = useQueryClient();
  const { subscriptions, isLoading, filters, setFilters } = useUserSubscriptions();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status });
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    try {
      setProcessingId(subscriptionId);
      
      // Get subscription details first
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            id,
            name,
            amount,
            periodicity,
            days_validity
          )
        `)
        .eq('id', subscriptionId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!subscription) {
        toast.error("Assinatura não encontrada");
        return;
      }
      
      const today = new Date();
      
      // Calculate new end date based on the plan's days_validity
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + (subscription.plans?.days_validity || 30));
      
      // Update the subscription with new dates and status
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);
      
      if (updateError) throw updateError;
      
      // Create a new payment record for this renewal
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: subscription.user_id,
          subscription_id: subscriptionId,
          amount: subscription.plans?.amount || 0,
          status: 'pending',
          due_date: today.toISOString().split('T')[0],
          notes: `Renovação automática - ${subscription.plans?.name}`
        }]);
      
      if (paymentError) {
        console.error("Error creating payment:", paymentError);
        toast.error("A assinatura foi renovada, mas houve um erro ao criar o pagamento");
      }
      
      toast.success("Assinatura renovada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error("Erro ao renovar assinatura");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setProcessingId(subscriptionId);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);
      
      if (error) throw error;
      
      toast.success("Assinatura cancelada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setProcessingId(null);
    }
  };

  const activeCount = subscriptions.filter(sub => sub.status === 'active').length;
  const expiredCount = subscriptions.filter(sub => sub.status === 'expired').length;
  const totalCount = subscriptions.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Gerenciar Adesões</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Adesões</h2>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie as assinaturas de planos dos alunos
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] })}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assinaturas Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
            </div>
            <CalendarX className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Assinaturas</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, email ou plano..." 
            className="pl-8"
            value={filters.searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select 
            value={filters.status} 
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
              <SelectItem value="canceled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Término</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.profiles?.name || 'N/A'}</TableCell>
                  <TableCell>{sub.plans?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {sub.plans?.amount 
                      ? `R$ ${sub.plans.amount.toFixed(2)}`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>{sub.formattedStartDate}</TableCell>
                  <TableCell>{sub.formattedEndDate}</TableCell>
                  <TableCell>
                    {sub.status === 'active' && !sub.isExpired && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Ativo
                      </Badge>
                    )}
                    {(sub.status === 'expired' || sub.isExpired) && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Vencido
                      </Badge>
                    )}
                    {sub.status === 'canceled' && (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        Cancelado
                      </Badge>
                    )}
                    {sub.status === 'active' && sub.daysUntilExpiration !== null && sub.daysUntilExpiration <= 7 && (
                      <Badge variant="outline" className="ml-2 border-amber-200 text-amber-800">
                        {sub.daysUntilExpiration} dias
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.status === 'expired' || sub.isExpired ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleRenewSubscription(sub.id)}
                        disabled={processingId === sub.id}
                      >
                        {processingId === sub.id ? 'Processando...' : 'Renovar'}
                      </Button>
                    ) : sub.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancelSubscription(sub.id)}
                        disabled={processingId === sub.id}
                      >
                        {processingId === sub.id ? 'Processando...' : 'Cancelar'}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleRenewSubscription(sub.id)}
                        disabled={processingId === sub.id}
                      >
                        {processingId === sub.id ? 'Processando...' : 'Reativar'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubscriptionsManagement;
