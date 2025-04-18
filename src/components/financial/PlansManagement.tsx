
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Settings, 
  Plus, 
  FileText, 
  CheckSquare,
  Pencil
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PlansManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select(`
          *,
          subscriptions (
            id,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(plan => ({
        ...plan,
        activeSubscribersCount: plan.subscriptions?.filter(s => s.status === 'active').length || 0,
        subscribersCount: plan.subscriptions?.length || 0
      }));
    },
  });

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gerenciar Planos</h2>
          <Button disabled>Novo Plano</Button>
        </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Planos</h2>
          <p className="text-sm text-muted-foreground">
            Configure os planos disponíveis para seus alunos
          </p>
        </div>
        <Button onClick={() => {
          setEditingPlan(null);
          setIsDialogOpen(true);
        }} className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
              Planos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {plans?.filter(plan => plan.active).length || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-green-500" />
              Total de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{plans?.length || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-1 text-purple-500" />
              Total de Assinantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {plans?.reduce((acc, plan) => acc + plan.subscribersCount, 0) || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckSquare className="h-4 w-4 mr-1 text-amber-500" />
              Assinaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {plans?.reduce((acc, plan) => acc + plan.activeSubscribersCount, 0) || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos os Planos</TabsTrigger>
          <TabsTrigger value="active">Planos Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Planos Inativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="w-full">
          <PlanTable plans={plans || []} onEditPlan={handleEditPlan} />
        </TabsContent>
        
        <TabsContent value="active" className="w-full">
          <PlanTable 
            plans={(plans || []).filter(plan => plan.active)} 
            onEditPlan={handleEditPlan} 
          />
        </TabsContent>
        
        <TabsContent value="inactive" className="w-full">
          <PlanTable 
            plans={(plans || []).filter(plan => !plan.active)} 
            onEditPlan={handleEditPlan} 
          />
        </TabsContent>
      </Tabs>

      <NewPlanDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        editingPlan={editingPlan}
        onSuccess={() => {
          refetch();
          setEditingPlan(null);
        }}
      />
    </div>
  );
};

interface PlanTableProps {
  plans: any[];
  onEditPlan: (plan: any) => void;
}

const PlanTable: React.FC<PlanTableProps> = ({ plans, onEditPlan }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Periodicidade</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Limite</TableHead>
            <TableHead>Assinantes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length > 0 ? (
            plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.description ? 
                  (plan.description.length > 20 ? 
                    plan.description.substring(0, 20) + '...' : 
                    plan.description) : 
                  '-'}
                </TableCell>
                <TableCell>R$ {plan.amount?.toFixed(2)}</TableCell>
                <TableCell>R$ {plan.enrollment_fee?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>{plan.periodicity}</TableCell>
                <TableCell>{plan.days_validity} dias</TableCell>
                <TableCell>
                  {plan.check_in_limit_type === 'Ilimitado' ? (
                    <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                      Ilimitado
                    </Badge>
                  ) : (
                    <Badge variant="outline">{plan.check_in_limit_type}</Badge>
                  )}
                </TableCell>
                <TableCell>{plan.activeSubscribersCount}/{plan.subscribersCount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPlan(plan)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                Nenhum plano encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlansManagement;
