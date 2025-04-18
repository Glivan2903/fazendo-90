
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import NewPlanDialog from './NewPlanDialog';

const PlansManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;
      toast.success('Status do plano atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status do plano:', error);
      toast.error('Erro ao atualizar status do plano');
    }
  };

  if (isLoading) {
    return <div>Carregando planos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciar Planos</h2>
        <Button onClick={() => setIsDialogOpen(true)}>Novo Plano</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Periodicidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans?.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.name}</TableCell>
              <TableCell>{plan.description}</TableCell>
              <TableCell>R$ {plan.amount.toFixed(2)}</TableCell>
              <TableCell>{plan.periodicity}</TableCell>
              <TableCell>{plan.active ? 'Ativo' : 'Inativo'}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePlanStatus(plan.id, plan.active)}
                >
                  {plan.active ? 'Desativar' : 'Ativar'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <NewPlanDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};

export default PlansManagement;
