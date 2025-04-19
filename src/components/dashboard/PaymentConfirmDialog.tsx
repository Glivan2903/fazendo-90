
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onConfirmed: () => void;
}

export default function PaymentConfirmDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onConfirmed
}: PaymentConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);

      // 1. Buscar informações de assinatura pendente
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError);
      }

      // 2. Buscar fatura bancária pendente
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('bank_invoices')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (invoiceError && invoiceError.code !== 'PGRST116') {
        console.error('Error fetching invoice:', invoiceError);
      }

      // 3. Buscar pagamento pendente
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (paymentError && paymentError.code !== 'PGRST116') {
        console.error('Error fetching payment:', paymentError);
      }

      // 4. Atualizar status do usuário para Ativo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'Ativo' })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 5. Atualizar a assinatura para ativa, se existir
      let updatedSubscription = null;
      
      if (subscriptionData) {
        const { data, error: updateSubscriptionError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriptionData.id)
          .select()
          .single();

        if (updateSubscriptionError) throw updateSubscriptionError;
        updatedSubscription = data;
      } else {
        // Buscar todas as assinaturas do usuário
        const { data: allSubscriptions, error: allSubsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!allSubsError && allSubscriptions && allSubscriptions.length > 0) {
          // Atualizar a assinatura mais recente para ativa
          const { data, error: updateSubError } = await supabase
            .from('subscriptions')
            .update({ 
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', allSubscriptions[0].id)
            .select()
            .single();
          
          if (updateSubError) throw updateSubError;
          updatedSubscription = data;
        }
      }

      // 6. Atualizar fatura bancária para paga, se existir
      if (invoiceData) {
        const { error: updateInvoiceError } = await supabase
          .from('bank_invoices')
          .update({ 
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', invoiceData.id);

        if (updateInvoiceError) throw updateInvoiceError;
      }

      // 7. Atualizar status do pagamento para pago, se existir
      if (paymentData) {
        const { error: updatePaymentError } = await supabase
          .from('payments')
          .update({ 
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', paymentData.id);

        if (updatePaymentError) throw updatePaymentError;
      }
      
      // 8. Atualizar o profile com o subscription_id se a assinatura foi atualizada
      if (updatedSubscription) {
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ 
            subscription_id: updatedSubscription.id
          })
          .eq('id', userId);
          
        if (updateProfileError) throw updateProfileError;
      }

      toast.success(`Pagamento confirmado para ${userName}`);
      onConfirmed();
      onOpenChange(false);

    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Erro ao confirmar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <p>Deseja confirmar o pagamento para <strong>{userName}</strong>?</p>
          <p className="text-sm text-muted-foreground mt-2">
            Isto irá ativar o usuário, sua assinatura e marcar a fatura como paga.
          </p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? "Confirmando..." : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
