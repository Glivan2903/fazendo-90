
import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface NewPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated: () => void;
}

interface PaymentFormData {
  user_id: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  payment_method: string;
  notes?: string;
  status: string;
}

const NewPaymentDialog: React.FC<NewPaymentDialogProps> = ({
  isOpen,
  onClose,
  onPaymentCreated
}) => {
  const form = useForm<PaymentFormData>();
  const { toast } = useToast();

  // Fetch active users with their subscriptions
  const { data: users } = useQuery({
    queryKey: ['users-with-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, subscription_id')
        .eq('status', 'Ativo')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch active subscriptions 
  const { data: subscriptions } = useQuery({
    queryKey: ['active-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id, plans(name, amount)')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      // Find the user's subscription
      const user = users?.find(u => u.id === data.user_id);
      
      if (!user?.subscription_id) {
        toast({
          title: "Erro",
          description: "Este usuário não possui assinatura ativa",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: data.user_id,
          subscription_id: user.subscription_id,
          amount: data.amount,
          due_date: data.due_date,
          payment_date: data.payment_date,
          payment_method: data.payment_method,
          notes: data.notes,
          status: data.payment_date ? 'paid' : 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso",
      });
      onPaymentCreated();
      onClose();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive"
      });
    }
  };

  // Find users with active subscriptions
  const usersWithSubscriptions = users?.filter(user => 
    user.subscription_id !== null
  );

  // For a selected user, get the subscription amount
  const getUserSubscriptionAmount = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user?.subscription_id) return 0;
    
    const subscription = subscriptions?.find(s => s.id === user.subscription_id);
    return subscription?.plans?.amount || 0;
  };

  // Set the amount when user is selected
  const handleUserChange = (userId: string) => {
    form.setValue('user_id', userId);
    const amount = getUserSubscriptionAmount(userId);
    if (amount) {
      form.setValue('amount', amount);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select 
                    onValueChange={(value) => handleUserChange(value)} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersWithSubscriptions?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? new Date().toISOString().split('T')[0] : undefined);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Pagamento já recebido
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPaymentDialog;
