
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  amount: z.string().min(1, 'Valor é obrigatório'),
  enrollment_fee: z.string().default("0"),
  periodicity: z.enum(['Mensal', 'Trimestral', 'Semestral', 'Anual']),
  days_validity: z.string().default("30"),
  check_in_limit_type: z.enum(['Ilimitado', 'Limitado por quantidade', 'Limitado por horário', 'Limitado por quantidade e horário', 'Limitado por turma fixa']),
  check_in_limit_qty: z.string().optional(),
  single_checkin_per_day: z.boolean().default(false),
  auto_renewal: z.boolean().default(false),
  allows_suspension: z.boolean().default(false),
  suspension_days: z.string().optional(),
});

interface NewPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewPlanDialog: React.FC<NewPlanDialogProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [showLimitOptions, setShowLimitOptions] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: '',
      enrollment_fee: '0',
      periodicity: 'Mensal',
      days_validity: '30',
      check_in_limit_type: 'Ilimitado',
      check_in_limit_qty: '',
      single_checkin_per_day: false,
      auto_renewal: false,
      allows_suspension: false,
      suspension_days: '',
    },
  });

  React.useEffect(() => {
    const limitType = form.watch('check_in_limit_type');
    setShowLimitOptions(limitType !== 'Ilimitado');
  }, [form.watch('check_in_limit_type')]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from('plans')
        .insert([
          {
            name: values.name,
            description: values.description,
            amount: parseFloat(values.amount),
            enrollment_fee: parseFloat(values.enrollment_fee || '0'),
            periodicity: values.periodicity,
            days_validity: parseInt(values.days_validity || '30'),
            check_in_limit_type: values.check_in_limit_type,
            check_in_limit_qty: values.check_in_limit_qty ? parseInt(values.check_in_limit_qty) : null,
            single_checkin_per_day: values.single_checkin_per_day,
            auto_renewal: values.auto_renewal,
            allows_suspension: values.allows_suspension,
            suspension_days: values.suspension_days ? parseInt(values.suspension_days) : null,
          },
        ]);

      if (error) throw error;

      toast.success('Plano criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast.error('Erro ao criar plano');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Novo Plano</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Plano Mensal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodicity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidade <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a periodicidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Trimestral">Trimestral</SelectItem>
                        <SelectItem value="Semestral">Semestral</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descreva detalhes sobre o plano"
                        className="resize-none" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mensal (R$) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enrollment_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Matrícula (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days_validity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de Validade</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium text-sm">Limites e Configurações</h3>

              <FormField
                control={form.control}
                name="check_in_limit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de limite" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ilimitado">Ilimitado</SelectItem>
                        <SelectItem value="Limitado por quantidade">Limitado por quantidade de check-in</SelectItem>
                        <SelectItem value="Limitado por horário">Limitado por horário</SelectItem>
                        <SelectItem value="Limitado por quantidade e horário">Limitado por quantidade de check-in e horário</SelectItem>
                        <SelectItem value="Limitado por turma fixa">Limitado por turma fixa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showLimitOptions && (
                <FormField
                  control={form.control}
                  name="check_in_limit_qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Check-ins</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="1" 
                          placeholder="Quantidade máxima de check-ins permitidos"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="single_checkin_per_day"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Permitir apenas 1 check-in por dia</FormLabel>
                      <FormDescription>
                        O atleta não poderá realizar diferentes aulas/programas no mesmo dia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="auto_renewal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Renovação Automática</FormLabel>
                      <FormDescription>
                        O plano será renovado automaticamente ao final do período
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allows_suspension"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Permitir Trancamento</FormLabel>
                      <FormDescription>
                        O aluno pode ficar ausente por um período e terá compensação no final
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('allows_suspension') && (
                <FormField
                  control={form.control}
                  name="suspension_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias de Trancamento Permitidos</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="1" 
                          placeholder="Quantidade máxima de dias para trancamento"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button type="submit" className="w-full">
              Criar Plano
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPlanDialog;
