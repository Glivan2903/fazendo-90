
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface NewPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentCreated?: () => void;
  userId?: string;
  selectedUserOnly?: boolean;
}

const paymentMethods = [
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "bank_transfer", label: "Transferência Bancária" }
];

const paymentStatus = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "overdue", label: "Atrasado" },
  { value: "canceled", label: "Cancelado" }
];

export default function NewPaymentDialog({ 
  open, 
  onOpenChange, 
  onPaymentCreated,
  userId,
  selectedUserOnly = false
}: NewPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false);
  const [paymentDatePopoverOpen, setPaymentDatePopoverOpen] = useState(false);
  const [monthlyPaymentExists, setMonthlyPaymentExists] = useState(false);
  const [bankAccounts, setBankAccounts] = useState(["Nubank", "Bradesco"]);
  const [form, setForm] = useState({
    userId: userId || '',
    subscriptionId: '',
    amount: '',
    dueDate: new Date(),
    paymentDate: null as Date | null,
    status: 'pending',
    paymentMethod: '',
    notes: '',
    bankAccount: 'Nubank'
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email');
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Erro ao carregar usuários");
      }
    };
    
    if (open && !selectedUserOnly) {
      fetchUsers();
    }
  }, [open, selectedUserOnly]);

  // Fetch subscriptions when user changes
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!form.userId) {
        setSubscriptions([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plans (
              name,
              amount,
              days_validity
            )
          `)
          .eq('user_id', form.userId)
          .order('end_date', { ascending: false });
          
        if (error) throw error;
        
        // Calculate subscription label for each subscription
        const processedSubscriptions = data?.map(sub => {
          const endDate = new Date(sub.end_date);
          const label = `${sub.plans?.name} (válido até ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })})`;
          
          return {
            ...sub,
            label,
            amount: sub.plans?.amount || 0
          };
        }) || [];
        
        setSubscriptions(processedSubscriptions);
        
        // Auto-select the first subscription if available
        if (processedSubscriptions.length > 0 && !form.subscriptionId) {
          handleSubscriptionChange(processedSubscriptions[0].id);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        toast.error("Erro ao carregar assinaturas");
      }
    };
    
    if (form.userId) {
      fetchSubscriptions();
      checkExistingPaymentsForMonth(form.userId, form.dueDate);
    }
  }, [form.userId, form.dueDate]);

  // Fetch individual user if userId is provided
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        if (data) {
          setUsers([data]);
          setForm(prev => ({ ...prev, userId: data.id }));
          checkExistingPaymentsForMonth(data.id, form.dueDate);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    
    if (open && userId) {
      fetchUserInfo();
    }
  }, [open, userId]);

  const handleUserChange = (value: string) => {
    setForm({
      ...form,
      userId: value,
      subscriptionId: '',
      amount: ''
    });
  };

  const handleSubscriptionChange = (value: string) => {
    const subscription = subscriptions.find(sub => sub.id === value);
    setForm({
      ...form,
      subscriptionId: value,
      amount: subscription?.amount ? subscription.amount.toString() : ''
    });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (date) {
      setForm({ ...form, dueDate: date });
      if (form.userId) {
        checkExistingPaymentsForMonth(form.userId, date);
      }
      setDueDatePopoverOpen(false);
    }
  };

  const handlePaymentDateChange = (date: Date | undefined) => {
    setForm({ ...form, paymentDate: date || null });
    setPaymentDatePopoverOpen(false);
  };

  const checkExistingPaymentsForMonth = async (userId: string, date: Date) => {
    try {
      const { data, error } = await supabase.rpc('has_payment_for_month', { user_id: userId, month: date.toISOString() });
      
      if (error) throw error;
      
      setMonthlyPaymentExists(!!data);
      
      // Show warning if payment exists
      if (data) {
        toast.warning("Já existe um pagamento para este mês. Considere editar o pagamento existente.");
      }
    } catch (error) {
      console.error("Error checking existing payments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!form.userId || !form.amount) {
        toast.error("Por favor preencha todos os campos obrigatórios");
        return;
      }
      
      // Create the payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            user_id: form.userId,
            subscription_id: form.subscriptionId || null,
            amount: parseFloat(form.amount),
            due_date: format(form.dueDate, 'yyyy-MM-dd'),
            payment_date: form.paymentDate ? format(form.paymentDate, 'yyyy-MM-dd') : null,
            status: form.status,
            payment_method: form.paymentMethod || null,
            notes: form.notes || null
          }
        ])
        .select()
        .single();
      
      if (paymentError) throw paymentError;
      
      // Criar fatura bancária
      if (payment) {
        const { error: invoiceError } = await supabase
          .from('bank_invoices')
          .insert([
            {
              user_id: form.userId,
              due_date: format(form.dueDate, 'yyyy-MM-dd'),
              payment_date: form.paymentDate ? format(form.paymentDate, 'yyyy-MM-dd') : null,
              total_amount: parseFloat(form.amount),
              discount_amount: 0,
              status: form.status,
              buyer_name: users.find(u => u.id === form.userId)?.name || 'Cliente',
              payment_method: form.paymentMethod || null,
              invoice_number: await generateInvoiceNumber(),
              bank_account: form.bankAccount,
              transaction_type: 'income',
              category: 'Mensalidade'
            }
          ]);
        
        if (invoiceError) {
          console.error("Erro ao criar fatura:", invoiceError);
          toast.error("Pagamento criado, mas houve um erro ao gerar a fatura");
        }
      }
      
      // Update user status if payment is marked as paid
      if (form.status === 'paid') {
        await updateUserAndSubscriptionStatus(form.userId);
      }
      
      toast.success("Pagamento criado com sucesso!");
      
      // Reset form
      setForm({
        userId: userId || '',
        subscriptionId: '',
        amount: '',
        dueDate: new Date(),
        paymentDate: null,
        status: 'pending',
        paymentMethod: '',
        notes: '',
        bankAccount: 'Nubank'
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      
      if (onPaymentCreated) {
        onPaymentCreated();
      }
      
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast.error(`Erro ao criar pagamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserAndSubscriptionStatus = async (userId: string) => {
    try {
      // Update the user's status to active
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'Ativo' })
        .eq('id', userId);

      if (profileError) {
        console.error("Error updating profile status:", profileError);
        throw profileError;
      }

      // Update the subscription status if it exists
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .eq('status', 'expired');

      if (subError && subError.code !== 'PGRST116') { // No rows updated is not an error
        console.error("Error updating subscription status:", subError);
        throw subError;
      }
      
      console.log("User and subscription status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      // We don't want to fail the payment creation if status update fails
      toast.error("Pagamento criado, mas houve um erro ao atualizar o status do usuário");
    }
  };
  
  const generateInvoiceNumber = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('generate_invoice_number');
      
      if (error) throw error;
      return data || "1";
    } catch (error) {
      console.error("Error generating invoice number:", error);
      // Fallback: get current timestamp as invoice number
      return Date.now().toString().substring(5);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Cliente (Usuário) */}
          <div className="space-y-2">
            <Label htmlFor="user">Cliente</Label>
            {selectedUserOnly && users.length > 0 ? (
              <div className="p-2 border rounded-md">
                {users[0]?.name} ({users[0]?.email})
              </div>
            ) : (
              <Select 
                value={form.userId} 
                onValueChange={handleUserChange}
                disabled={loading}
                required
              >
                <SelectTrigger>
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
            )}
          </div>
          
          {/* Assinatura */}
          <div className="space-y-2">
            <Label htmlFor="subscription">Assinatura</Label>
            <Select 
              value={form.subscriptionId} 
              onValueChange={handleSubscriptionChange}
              disabled={loading || subscriptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma assinatura" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              disabled={loading}
              required
            />
          </div>
          
          {/* Data de Vencimento e Pagamento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover open={dueDatePopoverOpen} onOpenChange={setDueDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.dueDate && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.dueDate ? (
                      format(form.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.dueDate}
                    onSelect={handleDueDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {monthlyPaymentExists && (
                <p className="text-amber-600 text-xs">
                  Já existe um pagamento para este mês
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Data de Pagamento</Label>
              <Popover open={paymentDatePopoverOpen} onOpenChange={setPaymentDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.paymentDate && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.paymentDate ? (
                      format(form.paymentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.paymentDate || undefined}
                    onSelect={handlePaymentDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Status e Método de Pagamento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={form.status} 
                onValueChange={value => setForm({ ...form, status: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatus.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <Select 
                value={form.paymentMethod} 
                onValueChange={value => setForm({ ...form, paymentMethod: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conta bancária */}
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Conta</Label>
            <Select 
              value={form.bankAccount} 
              onValueChange={value => setForm({ ...form, bankAccount: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nubank">Nubank</SelectItem>
                <SelectItem value="Bradesco">Bradesco</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !form.userId || !form.amount}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
