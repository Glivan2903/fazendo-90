
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated?: () => void;
}

interface NewPaymentForm {
  user_id: string;
  subscription_id: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: string;
  payment_method?: string;
  notes?: string;
}

const NewPaymentDialog: React.FC<NewPaymentDialogProps> = ({ isOpen, onClose, onPaymentCreated }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<NewPaymentForm>({
    defaultValues: {
      status: 'pending',
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
    }
  });

  const watchUserId = watch('user_id');
  const watchSubscriptionId = watch('subscription_id');
  const watchPaymentDate = watch('payment_date');
  const watchStatus = watch('status');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    };

    if (isOpen) {
      fetchUsers();
      reset({
        status: 'pending',
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!watchUserId) {
        setSubscriptions([]);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            id, name, amount
          )
        `)
        .eq('user_id', watchUserId);

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return;
      }

      setSubscriptions(data || []);
      
      // If there's only one subscription, select it automatically
      if (data && data.length === 1) {
        setValue('subscription_id', data[0].id);
        // Set the amount from the plan
        if (data[0].plans && data[0].plans.amount) {
          setValue('amount', data[0].plans.amount);
        }
      } else {
        setValue('subscription_id', '');
      }
    };

    fetchSubscriptions();
  }, [watchUserId, setValue]);

  useEffect(() => {
    // When subscription changes, update the amount from the plan
    if (watchSubscriptionId) {
      const subscription = subscriptions.find(s => s.id === watchSubscriptionId);
      if (subscription && subscription.plans && subscription.plans.amount) {
        setValue('amount', subscription.plans.amount);
      }
    }
  }, [watchSubscriptionId, subscriptions, setValue]);

  useEffect(() => {
    // If payment_date is set, change status to paid
    if (watchPaymentDate && watchStatus === 'pending') {
      setValue('status', 'paid');
    }
    // If payment_date is removed, change status back to pending
    else if (!watchPaymentDate && watchStatus === 'paid') {
      setValue('status', 'pending');
    }
  }, [watchPaymentDate, watchStatus, setValue]);

  const onSubmit = async (data: NewPaymentForm) => {
    setLoading(true);
    try {
      // Insert the payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: data.user_id,
          subscription_id: data.subscription_id,
          amount: data.amount,
          due_date: data.due_date,
          payment_date: data.payment_date || null,
          status: data.status,
          payment_method: data.payment_method || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // If the payment is marked as paid and has a subscription_id, update the subscription status to active
      if (data.status === 'paid' && data.subscription_id) {
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', data.subscription_id);

        if (subscriptionError) throw subscriptionError;
      }

      toast.success('Pagamento criado com sucesso!');
      onClose();
      if (onPaymentCreated) onPaymentCreated();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Erro ao criar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (userId: string) => {
    setValue('user_id', userId);
    setSelectedUser(userId);
    // Reset subscription when user changes
    setValue('subscription_id', '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">Cliente</Label>
            <Select value={selectedUser} onValueChange={handleUserChange}>
              <SelectTrigger id="user_id">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user_id && <p className="text-sm text-red-500">Cliente é obrigatório</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription_id">Assinatura</Label>
            <Select 
              value={watchSubscriptionId || ''}
              onValueChange={(value) => setValue('subscription_id', value)}
              disabled={!selectedUser || subscriptions.length === 0}
            >
              <SelectTrigger id="subscription_id">
                <SelectValue placeholder={selectedUser ? (subscriptions.length === 0 ? "Sem assinaturas disponíveis" : "Selecione uma assinatura") : "Selecione um cliente primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((subscription) => (
                  <SelectItem key={subscription.id} value={subscription.id}>
                    {subscription.plans?.name || 'Sem plano'} (válido até {format(new Date(subscription.end_date), 'dd/MM/yyyy', { locale: ptBR })})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subscription_id && <p className="text-sm text-red-500">Assinatura é obrigatória</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { required: true, min: 0 })}
            />
            {errors.amount && <p className="text-sm text-red-500">Valor é obrigatório e deve ser positivo</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('due_date') ? (
                      format(new Date(watch('due_date')), 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('due_date') ? new Date(watch('due_date')) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setValue('due_date', date.toISOString().split('T')[0]);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Data de Pagamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('payment_date') ? (
                      format(new Date(watch('payment_date')), 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('payment_date') ? new Date(watch('payment_date')) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setValue('payment_date', date.toISOString().split('T')[0]);
                      } else {
                        setValue('payment_date', undefined);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select 
                value={watch('payment_method') || ''}
                onValueChange={(value) => setValue('payment_method', value)}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPaymentDialog;
