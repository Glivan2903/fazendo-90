
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

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
      console.log(`Iniciando confirmação de pagamento para usuário: ${userId}`);

      // Check for existing paid invoices in the current month
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: existingPaidInvoices, error: checkError } = await supabase
        .from('bank_invoices')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'paid')
        .gte('payment_date', startOfMonth.toISOString().split('T')[0])
        .lte('payment_date', endOfMonth.toISOString().split('T')[0]);

      if (checkError) throw checkError;

      // If there are already paid invoices this month, update profile and return
      if (existingPaidInvoices && existingPaidInvoices.length > 0) {
        // Just update profile status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ status: 'Ativo' })
          .eq('id', userId);

        if (profileError) throw profileError;
        
        toast.success(`Status atualizado para ${userName}`);
        onConfirmed();
        onOpenChange(false);
        return;
      }

      // Get the pending subscription
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

      // If subscription exists, update it to active
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

      // Get the pending invoice
      const { data: pendingInvoice, error: invoiceError } = await supabase
        .from('bank_invoices')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (invoiceError) throw invoiceError;

      // Update the invoice and profile
      if (pendingInvoice) {
        const { error: updateError } = await supabase
          .from('bank_invoices')
          .update({ 
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'PIX',
            category: 'Mensalidade'
          })
          .eq('id', pendingInvoice.id);

        if (updateError) throw updateError;

        // Update profile status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ status: 'Ativo' })
          .eq('id', userId);

        if (profileError) throw profileError;

        // Update any pending payments
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ 
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'PIX'
          })
          .eq('user_id', userId)
          .eq('status', 'pending');

        if (paymentError) throw paymentError;
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
          <DialogDescription>
            Esta ação irá processar o pagamento e ativar o usuário.
          </DialogDescription>
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
