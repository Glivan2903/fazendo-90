
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import NewPlanDialog from './NewPlanDialog';
import EditPlanDialog from './EditPlanDialog';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  enrollment_fee: number;
  periodicity: string;
  days_validity: number;
  check_in_limit_type: string;
  check_in_limit_qty: number | null;
  single_checkin_per_day: boolean;
  auto_renewal: boolean;
  allows_suspension: boolean;
  suspension_days: number | null;
  active: boolean;
  created_at: string;
}

const PlansManagement: React.FC = () => {
  const [newPlanDialogOpen, setNewPlanDialogOpen] = useState(false);
  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Plan[];
    }
  });

  const handleActivateToggle = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ active: !plan.active })
        .eq('id', plan.id);
        
      if (error) throw error;
      
      toast.success(`Plano ${plan.active ? 'desativado' : 'ativado'} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    } catch (error: any) {
      console.error('Erro ao atualizar status do plano:', error);
      toast.error(`Erro ao atualizar plano: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setEditPlanDialogOpen(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['plans'] });
  };

  if (isLoading) return <div className="flex justify-center p-4">Carregando planos...</div>;
  if (error) return <div className="text-red-500 p-4">Erro ao carregar planos: {(error as Error).message}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos</CardTitle>
            <CardDescription>Gerencie os planos disponíveis para os alunos</CardDescription>
          </div>
          <Button onClick={() => setNewPlanDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de planos disponíveis</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Periodicidade</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.periodicity}</TableCell>
                  <TableCell className="text-right">R$ {plan.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {plan.check_in_limit_type === 'Ilimitado' ? (
                      'Ilimitado'
                    ) : (
                      <>
                        {plan.check_in_limit_qty} check-ins
                        {plan.single_checkin_per_day && ' (1 por dia)'}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.active ? "default" : "secondary"} className={plan.active ? "bg-green-100 text-green-800" : ""}>
                      {plan.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Switch 
                      checked={plan.active} 
                      onCheckedChange={() => handleActivateToggle(plan)} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewPlanDialog 
        open={newPlanDialogOpen} 
        onOpenChange={setNewPlanDialogOpen}
        onSuccess={handleRefresh}
      />

      {editingPlan && (
        <EditPlanDialog
          open={editPlanDialogOpen}
          onOpenChange={setEditPlanDialogOpen}
          plan={editingPlan}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default PlansManagement;
