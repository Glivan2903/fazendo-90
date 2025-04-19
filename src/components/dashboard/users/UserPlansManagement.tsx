
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, RefreshCcw, XCircle, CalendarCheck, CalendarX, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UserPlansManagementProps {
  userId: string | null;
}

const UserPlansManagement: React.FC<UserPlansManagementProps> = ({ userId }) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [isCheckinHistoryOpen, setIsCheckinHistoryOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: userSubscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            id,
            name,
            amount,
            periodicity,
            days_validity,
            auto_renewal
          )
        `)
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Process and format the subscriptions
      return data.map(sub => {
        const startDate = new Date(sub.start_date);
        const endDate = new Date(sub.end_date);
        const isExpired = endDate < new Date();
        const formattedStartDate = format(startDate, 'dd/MM/yyyy', { locale: ptBR });
        const formattedEndDate = format(endDate, 'dd/MM/yyyy', { locale: ptBR });

        return {
          ...sub,
          isExpired,
          formattedStartDate,
          formattedEndDate
        };
      });
    },
    enabled: !!userId
  });

  const { data: userCheckins } = useQuery({
    queryKey: ['user-checkins', userId, selectedPlan?.id],
    queryFn: async () => {
      if (!userId || !selectedPlan?.id) return [];

      const startDate = new Date(selectedPlan.start_date);
      const endDate = new Date(selectedPlan.end_date);

      const { data, error } = await supabase
        .from('checkins')
        .select(`
          id,
          checked_in_at,
          status,
          classes (
            date,
            start_time,
            programs (name)
          )
        `)
        .eq('user_id', userId)
        .gte('checked_in_at', startDate.toISOString())
        .lte('checked_in_at', endDate.toISOString())
        .order('checked_in_at', { ascending: false });

      if (error) throw error;

      return data.map(checkin => ({
        id: checkin.id,
        date: checkin.classes?.date || format(new Date(checkin.checked_in_at), 'yyyy-MM-dd'),
        program: checkin.classes?.programs?.name || 'CrossFit',
        time: format(new Date(checkin.checked_in_at), 'HH:mm'),
        origin: 'Aplicativo',
        status: checkin.status
      }));
    },
    enabled: !!userId && !!selectedPlan?.id
  });

  const handleCancelPlan = async (subscriptionId: string) => {
    try {
      setProcessingPlanId(subscriptionId);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);
      
      if (error) throw error;
      
      toast.success("Plano cancelado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      
    } catch (error) {
      console.error("Error canceling plan:", error);
      toast.error("Erro ao cancelar plano");
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleRenewPlan = async (subscription: any) => {
    try {
      setProcessingPlanId(subscription.id);
      
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
        .eq('id', subscription.id);
      
      if (updateError) throw updateError;
      
      // Create a new payment record for this renewal
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          amount: subscription.plans?.amount || 0,
          status: 'pending',
          due_date: today.toISOString().split('T')[0],
          notes: `Renovação - ${subscription.plans?.name}`
        }]);
      
      if (paymentError) {
        console.error("Error creating payment:", paymentError);
        toast.error("O plano foi renovado, mas houve um erro ao criar o pagamento");
      }
      
      toast.success("Plano renovado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      
    } catch (error) {
      console.error("Error renewing plan:", error);
      toast.error("Erro ao renovar plano");
    } finally {
      setProcessingPlanId(null);
    }
  };

  const openCheckinHistory = (plan: any) => {
    setSelectedPlan(plan);
    setIsCheckinHistoryOpen(true);
  };

  const getStatusBadge = (subscription: any) => {
    if (subscription.status === 'active' && !subscription.isExpired) {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
    } else if (subscription.status === 'canceled') {
      return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Planos do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <CalendarCheck className="mr-2 h-5 w-5 text-blue-600" />
          Planos do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de início</TableHead>
                <TableHead>Data de término</TableHead>
                <TableHead>Checkins</TableHead>
                <TableHead>Renovação automática</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Histórico</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSubscriptions && userSubscriptions.length > 0 ? (
                userSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.plans?.name || "N/A"}</TableCell>
                    <TableCell>Plano</TableCell>
                    <TableCell>{subscription.formattedStartDate}</TableCell>
                    <TableCell>{subscription.formattedEndDate}</TableCell>
                    <TableCell>
                      {/* Placeholder for checkin count */}
                      {Math.floor(Math.random() * 20)}
                    </TableCell>
                    <TableCell>{subscription.plans?.auto_renewal ? "Sim" : "Não"}</TableCell>
                    <TableCell>{getStatusBadge(subscription)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center text-blue-600"
                        onClick={() => openCheckinHistory(subscription)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        Histórico
                      </Button>
                    </TableCell>
                    <TableCell>
                      {subscription.status === 'active' && !subscription.isExpired ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleCancelPlan(subscription.id)}
                          disabled={processingPlanId === subscription.id}
                        >
                          <CalendarX className="h-4 w-4 mr-1" />
                          {processingPlanId === subscription.id ? 'Processando...' : 'Cancelar'}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleRenewPlan(subscription)}
                          disabled={processingPlanId === subscription.id}
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          {processingPlanId === subscription.id ? 'Processando...' : 'Renovar'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum plano encontrado para este usuário
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isCheckinHistoryOpen} onOpenChange={setIsCheckinHistoryOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Histórico de Check-ins</DialogTitle>
            </DialogHeader>
            
            {selectedPlan && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  Plano: <span className="font-semibold">{selectedPlan.plans?.name}</span> • 
                  Período: <span className="font-semibold">{selectedPlan.formattedStartDate} - {selectedPlan.formattedEndDate}</span>
                </p>
              </div>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-blue-600 text-white">
                  <TableRow>
                    <TableHead className="text-white">Data da classe</TableHead>
                    <TableHead className="text-white">Programa</TableHead>
                    <TableHead className="text-white">Início</TableHead>
                    <TableHead className="text-white">Origem</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCheckins && userCheckins.length > 0 ? (
                    userCheckins.map((checkin) => (
                      <TableRow key={checkin.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {format(new Date(checkin.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>{checkin.program}</TableCell>
                        <TableCell>{checkin.time}</TableCell>
                        <TableCell>{checkin.origin}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">CHECK-IN</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Nenhum check-in registrado neste período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Button variant="outline" onClick={() => setIsCheckinHistoryOpen(false)} className="mt-4">
              Fechar
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserPlansManagement;
