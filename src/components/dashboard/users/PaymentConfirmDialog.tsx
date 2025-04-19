
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

      // First check if there are any pending payments or invoices
      const { data: pendingInvoices, error: invoiceCheckError } = await supabase
        .from('bank_invoices')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (invoiceCheckError) throw invoiceCheckError;

      if (!pendingInvoices || pendingInvoices.length === 0) {
        toast.error("Não há faturas pendentes para este usuário");
        return;
      }

      // 1. Update profile status to Ativo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'Ativo' })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 2. Get the pending subscription for this user
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError;
      }

      // 3. If subscription exists, update it to active
      if (subscription) {
        const { error: updateSubError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (updateSubError) throw updateSubError;
      }

      // 4. Update bank invoice status to paid (only update pending invoices)
      const { error: invoiceError } = await supabase
        .from('bank_invoices')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (invoiceError) throw invoiceError;

      // 5. Update payments status to paid (only update pending payments)
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (paymentError) throw paymentError;

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
            Isto irá ativar o usuário e marcar a fatura como paga.
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
