
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [selectedPlanId, setSelectedPlanId] = useState("");
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
      // Auto select the first plan
      if (data && data.length > 0) {
        setSelectedPlanId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Erro ao carregar planos disponíveis");
    }
  };

  const handleApprove = async () => {
    try {
      if (!selectedPlanId) {
        toast.error("Por favor, selecione um plano");
        return;
      }

      setLoading(true);
      console.log(`Iniciando aprovação do usuário: ${userId} com plano: ${selectedPlanId}`);

      // Verificar se já existem itens de assinatura para evitar duplicação
      const { data: existingItems, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', userId);
        
      if (checkError) {
        console.error("Error checking existing subscriptions:", checkError);
      }
      
      // Limpar assinaturas existentes antes de criar novas
      if (existingItems && existingItems.length > 0) {
        console.log(`Removendo ${existingItems.length} assinaturas existentes`);
        
        // 1. Cancel all existing subscriptions
        const { error: cancelSubError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', userId);
        
        if (cancelSubError) {
          console.error("Error canceling existing subscriptions:", cancelSubError);
        }
      }
      
      // Verificar por faturas pendentes
      const { data: pendingInvoices, error: checkInvError } = await supabase
        .from('bank_invoices')
        .select('id, status')
        .eq('user_id', userId);
        
      if (checkInvError) {
        console.error("Error checking invoices:", checkInvError);
      }

      // Remover todas as faturas existentes para evitar duplicação
      if (pendingInvoices && pendingInvoices.length > 0) {
        console.log(`Removendo ${pendingInvoices.length} faturas existentes`);
        
        // 2. Remover todas as faturas (pendentes e pagas)
        const { error: cancelInvError } = await supabase
          .from('bank_invoices')
          .delete()
          .eq('user_id', userId);
        
        if (cancelInvError) {
          console.error("Error canceling invoices:", cancelInvError);
        }
      }

      // Verificar pagamentos existentes
      const { data: existingPayments, error: checkPayError } = await supabase
        .from('payments')
        .select('id, status')
        .eq('user_id', userId);
        
      if (checkPayError) {
        console.error("Error checking payments:", checkPayError);
      }
      
      // Remover todos os pagamentos para evitar duplicação
      if (existingPayments && existingPayments.length > 0) {
        console.log(`Removendo ${existingPayments.length} pagamentos existentes`);
        
        // 3. Remover todos os pagamentos
        const { error: cancelPayError } = await supabase
          .from('payments')
          .delete()
          .eq('user_id', userId);
        
        if (cancelPayError) {
          console.error("Error canceling payments:", cancelPayError);
        }
      }

      // 4. Update user status to Pendente
      const { error: statusError } = await supabase
        .from('profiles')
        .update({ status: 'Pendente' })
        .eq('id', userId);

      if (statusError) throw statusError;
      console.log("Status do perfil atualizado para Pendente");

      // 5. Create subscription for user based on selected plan with status pending
      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      if (!selectedPlan) throw new Error("Plano não encontrado");
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.days_validity);
      
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          plan_id: selectedPlanId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'pending'
        }])
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;
      console.log(`Nova assinatura criada: ${subscription.id}`);

      // 6. Generate invoice number
      const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
        .rpc('generate_invoice_number');
        
      if (invoiceNumberError) throw invoiceNumberError;
      
      const invoiceNumber = invoiceNumberData || "";
      console.log(`Número da fatura gerado: ${invoiceNumber}`);

      // 7. Create only one bank invoice for the plan
      const { data: bankInvoice, error: bankInvoiceError } = await supabase
        .from('bank_invoices')
        .insert({
          user_id: userId,
          total_amount: selectedPlan.amount,
          due_date: startDate.toISOString().split('T')[0],
          status: 'pending',
          category: 'Mensalidade',
          buyer_name: userName,
          transaction_type: 'income',
          invoice_number: invoiceNumber,
          discount_amount: 0,
          seller_name: 'Cross Box Fênix'
        })
        .select()
        .single();

      if (bankInvoiceError) throw bankInvoiceError;
      console.log(`Nova fatura bancária criada: ${bankInvoice.id}`);

      // 8. Create only one payment record linked to the invoice
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: userId,
          subscription_id: subscription.id,
          amount: selectedPlan.amount,
          due_date: startDate.toISOString().split('T')[0],
          status: 'pending',
          reference: `Mensalidade - ${userName}`,
          bank_invoice_id: bankInvoice.id
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;
      console.log(`Novo pagamento criado: ${payment.id}`);
      
      // 9. Update profile plan
      const { error: updatePlanError } = await supabase
        .from('profiles')
        .update({ 
          plan: selectedPlan.name,
          subscription_id: subscription.id
        })
        .eq('id', userId);
        
      if (updatePlanError) throw updatePlanError;
      console.log("Plano do perfil atualizado com sucesso");

      toast.success(`Plano atribuído a ${userName} com sucesso! Aguardando confirmação de pagamento.`);
      onApproved();
      onOpenChange(false);

    } catch (error) {
      console.error("Error approving user:", error);
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
              value={selectedPlanId} 
              onValueChange={setSelectedPlanId}
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
          
          {selectedPlanId && (
            <Alert className="bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Uma fatura será gerada automaticamente para este usuário.
              </AlertDescription>
            </Alert>
          )}
          
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
              onClick={handleApprove}
              disabled={loading || !selectedPlanId}
            >
              {loading ? "Aprovando..." : "Aprovar Usuário"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
