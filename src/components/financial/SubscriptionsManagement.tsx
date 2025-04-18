
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Loader2, CalendarDays, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SubscriptionsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles (id, name, email, avatar_url),
          plans (id, name, amount, periodicity, days_validity)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['subscription-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const [newSubscription, setNewSubscription] = useState({
    user_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: addDays(new Date(), 30).toISOString().split('T')[0],
    status: 'active',
  });

  const filteredSubscriptions = subscriptions?.filter((subscription) => {
    const userName = subscription.profiles?.name?.toLowerCase() || '';
    const userEmail = subscription.profiles?.email?.toLowerCase() || '';
    const planName = subscription.plans?.name?.toLowerCase() || '';
    
    const matchesSearch = searchQuery === '' || 
      userName.includes(searchQuery.toLowerCase()) ||
      userEmail.includes(searchQuery.toLowerCase()) ||
      planName.includes(searchQuery.toLowerCase());
      
    const matchesStatus = selectedStatus === null || subscription.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubscription = async () => {
    try {
      if (!newSubscription.user_id || !newSubscription.plan_id) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: newSubscription.user_id,
          plan_id: newSubscription.plan_id,
          start_date: newSubscription.start_date,
          end_date: newSubscription.end_date,
          status: newSubscription.status,
        }])
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Assinatura criada com sucesso!');
      setIsCreateDialogOpen(false);
      
      setNewSubscription({
        user_id: '',
        plan_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: addDays(new Date(), 30).toISOString().split('T')[0],
        status: 'active',
      });
      
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      toast.error('Erro ao criar assinatura');
    }
  };

  const handleUpdateSubscription = async () => {
    try {
      if (!selectedSubscription) return;

      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: selectedSubscription.plan_id,
          start_date: selectedSubscription.start_date,
          end_date: selectedSubscription.end_date,
          status: selectedSubscription.status,
        })
        .eq('id', selectedSubscription.id);

      if (error) throw error;

      toast.success('Assinatura atualizada com sucesso!');
      setIsEditDialogOpen(false);
      
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      toast.error('Erro ao atualizar assinatura');
    }
  };

  const handlePlanChange = (planId: string) => {
    const selectedPlan = plans?.find(p => p.id === planId);
    
    if (selectedPlan && selectedPlan.days_validity) {
      const startDate = new Date(newSubscription.start_date);
      const endDate = addDays(startDate, selectedPlan.days_validity);
      
      setNewSubscription({
        ...newSubscription,
        plan_id: planId,
        end_date: endDate.toISOString().split('T')[0],
      });
    } else {
      setNewSubscription({
        ...newSubscription,
        plan_id: planId,
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleStatusChange = async (subscriptionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', subscriptionId);

      if (error) throw error;
      
      toast.success(`Status da assinatura atualizado para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da assinatura');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gerenciar Adesões</h2>
          <Button disabled>Nova Adesão</Button>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activeSubscriptions = filteredSubscriptions?.filter(sub => sub.status === 'active').length || 0;
  const expiredSubscriptions = filteredSubscriptions?.filter(sub => sub.status === 'expired').length || 0;
  const cancelledSubscriptions = filteredSubscriptions?.filter(sub => sub.status === 'cancelled').length || 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Adesões</h2>
          <p className="text-sm text-muted-foreground">
            Administre as assinaturas dos alunos
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          Nova Adesão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
              Assinaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeSubscriptions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1 text-amber-500" />
              Assinaturas Expiradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{expiredSubscriptions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="h-4 w-4 mr-1 text-red-500" />
              Assinaturas Canceladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cancelledSubscriptions}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, email ou plano..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedStatus || ""}
          onValueChange={(value) => setSelectedStatus(value || null)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
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
            {filteredSubscriptions && filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.profiles?.name}</TableCell>
                  <TableCell>{subscription.plans?.name || '-'}</TableCell>
                  <TableCell>R$ {subscription.plans?.amount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{formatDate(subscription.start_date)}</TableCell>
                  <TableCell>{formatDate(subscription.end_date)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                        subscription.status === 'expired' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {subscription.status === 'active' ? 'Ativo' : 
                       subscription.status === 'expired' ? 'Expirado' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      
                      {subscription.status !== 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(subscription.id, 'active')}
                          className="text-green-700"
                        >
                          Reativar
                        </Button>
                      )}
                      
                      {subscription.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(subscription.id, 'cancelled')}
                          className="text-red-700"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchQuery || selectedStatus ? 
                    "Nenhuma assinatura corresponde aos filtros aplicados" : 
                    "Nenhuma assinatura encontrada"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Adesão</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="user_id">Aluno <span className="text-red-500">*</span></Label>
                <Select 
                  value={newSubscription.user_id} 
                  onValueChange={(value) => setNewSubscription({...newSubscription, user_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="plan_id">Plano <span className="text-red-500">*</span></Label>
                <Select 
                  value={newSubscription.plan_id} 
                  onValueChange={handlePlanChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.amount.toFixed(2)} ({plan.periodicity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSubscription.start_date ? (
                          format(new Date(newSubscription.start_date), 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(newSubscription.start_date)}
                        onSelect={(date) => {
                          if (date) {
                            const newStartDate = date.toISOString().split('T')[0];
                            const selectedPlan = plans?.find(p => p.id === newSubscription.plan_id);
                            
                            let newEndDate = newSubscription.end_date;
                            if (selectedPlan && selectedPlan.days_validity) {
                              newEndDate = addDays(date, selectedPlan.days_validity).toISOString().split('T')[0];
                            }
                            
                            setNewSubscription({
                              ...newSubscription,
                              start_date: newStartDate,
                              end_date: newEndDate
                            });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de término</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSubscription.end_date ? (
                          format(new Date(newSubscription.end_date), 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(newSubscription.end_date)}
                        onSelect={(date) => {
                          if (date) {
                            setNewSubscription({
                              ...newSubscription,
                              end_date: date.toISOString().split('T')[0]
                            });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {programs && programs.length > 0 && (
                <div className="space-y-2">
                  <Label>Programas</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {programs.map((program) => (
                      <div className="flex items-center space-x-2" key={program.id}>
                        <Checkbox 
                          id={`program-${program.id}`}
                          checked={selectedPrograms.includes(program.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPrograms([...selectedPrograms, program.id]);
                            } else {
                              setSelectedPrograms(selectedPrograms.filter(id => id !== program.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`program-${program.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {program.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubscription}>
              Criar Adesão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Adesão</DialogTitle>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Aluno</Label>
                  <Input 
                    value={selectedSubscription.profiles?.name || ''} 
                    disabled 
                  />
                </div>

                <div>
                  <Label htmlFor="plan_id">Plano</Label>
                  <Select 
                    value={selectedSubscription.plan_id} 
                    onValueChange={(value) => {
                      const selectedPlan = plans?.find(p => p.id === value);
                      
                      if (selectedPlan && selectedPlan.days_validity) {
                        const startDate = new Date(selectedSubscription.start_date);
                        const endDate = addDays(startDate, selectedPlan.days_validity);
                        
                        setSelectedSubscription({
                          ...selectedSubscription,
                          plan_id: value,
                          end_date: endDate.toISOString().split('T')[0],
                        });
                      } else {
                        setSelectedSubscription({
                          ...selectedSubscription,
                          plan_id: value,
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - R$ {plan.amount.toFixed(2)} ({plan.periodicity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data de início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedSubscription.start_date ? (
                            format(new Date(selectedSubscription.start_date), 'PPP', { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedSubscription.start_date ? new Date(selectedSubscription.start_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const newStartDate = date.toISOString().split('T')[0];
                              const selectedPlan = plans?.find(p => p.id === selectedSubscription.plan_id);
                              
                              let newEndDate = selectedSubscription.end_date;
                              if (selectedPlan && selectedPlan.days_validity) {
                                newEndDate = addDays(date, selectedPlan.days_validity).toISOString().split('T')[0];
                              }
                              
                              setSelectedSubscription({
                                ...selectedSubscription,
                                start_date: newStartDate,
                                end_date: newEndDate
                              });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Data de término</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedSubscription.end_date ? (
                            format(new Date(selectedSubscription.end_date), 'PPP', { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedSubscription.end_date ? new Date(selectedSubscription.end_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedSubscription({
                                ...selectedSubscription,
                                end_date: date.toISOString().split('T')[0]
                              });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={selectedSubscription.status} 
                    onValueChange={(value) => 
                      setSelectedSubscription({...selectedSubscription, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSubscription}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement;
