
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface ApproveUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onApproved: () => void;
}

export default function ApproveUserDialog({ 
  open, 
  onOpenChange, 
  userId,
  userName,
  onApproved
}: ApproveUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState<any[]>([]);

  React.useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('amount');

      if (error) throw error;
      setPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlan(data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      toast.error("Erro ao carregar planos disponíveis");
    }
  };

  const generateInvoiceNumber = async () => {
    const { data, error } = await supabase.rpc('generate_invoice_number');
    if (error) throw error;
    return data;
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      
      if (!selectedPlan) {
        toast.error("Selecione um plano");
        return;
      }

      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      if (!selectedPlanData) throw new Error("Plano não encontrado");

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + selectedPlanData.days_validity);

      // Check for existing subscriptions and invoices in current month
      const currentMonth = startDate.getMonth();
      const currentYear = startDate.getFullYear();
      
      // Check if user already has an invoice for the current month
      const { data: existingInvoices, error: checkInvoiceError } = await supabase
        .from('bank_invoices')
        .select('id')
        .eq('user_id', userId)
        .eq('transaction_type', 'income')
        .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
        .lte('created_at', new Date(currentYear, currentMonth + 1, 0).toISOString());

      if (checkInvoiceError) throw checkInvoiceError;
      
      // Check if user already has a payment for the current month
      const { data: existingPayments, error: checkPaymentError } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', userId)
        .gte('due_date', new Date(currentYear, currentMonth, 1).toISOString())
        .lte('due_date', new Date(currentYear, currentMonth + 1, 0).toISOString());
        
      if (checkPaymentError) throw checkPaymentError;

      if ((existingInvoices && existingInvoices.length > 0) || (existingPayments && existingPayments.length > 0)) {
        // User already has an invoice or payment for this month
        Alert({
          title: "Aviso",
          description: "Usuário já possui uma fatura ou pagamento para este mês.",
          variant: "default",
        });
        
        toast.info("Usuário já possui uma fatura ou pagamento para este mês");
        onOpenChange(false);
        return;
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();

      // Create subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: selectedPlan,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          status: 'pending'
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Create bank invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('bank_invoices')
        .insert({
          user_id: userId,
          invoice_number: invoiceNumber,
          total_amount: selectedPlanData.amount,
          due_date: format(startDate, 'yyyy-MM-dd'),
          status: 'pending',
          buyer_name: userName,
          category: 'Mensalidade',
          transaction_type: 'income'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          subscription_id: subscriptionData.id,
          amount: selectedPlanData.amount,
          due_date: format(startDate, 'yyyy-MM-dd'),
          status: 'pending',
          reference: `Plano ${selectedPlanData.name} - ${userName}`
        });

      if (paymentError) throw paymentError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: selectedPlanData.name,
          status: 'Pendente',
          subscription_id: subscriptionData.id
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast.success(`Usuário ${userName} aprovado. Fatura gerada com sucesso!`);
      onApproved();
      onOpenChange(false);

    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
      toast.error("Erro ao aprovar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aprovar Novo Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você está aprovando o acesso para <strong>{userName}</strong>. Selecione um plano para o usuário.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="plan">Selecione um Plano</Label>
            <Select 
              value={selectedPlan} 
              onValueChange={setSelectedPlan}
              disabled={loading || plans.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - R$ {plan.amount.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPlan && (
            <Alert className="bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Uma fatura será gerada automaticamente para este usuário.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={loading || !selectedPlan}
            >
              {loading ? "Aprovando..." : "Aprovar Usuário"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
