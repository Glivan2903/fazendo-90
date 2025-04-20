
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

  const cleanupUserFinancialRecords = async (userId: string) => {
    console.log(`Iniciando limpeza de registros financeiros para o usuário ${userId}`);
    
    try {
      // 1. Remover todas as faturas pagas (duplicadas)
      const { error: deletePaidInvoicesError } = await supabase
        .from('bank_invoices')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'paid');
        
      if (deletePaidInvoicesError) throw deletePaidInvoicesError;
      
      // 2. Remover todos os pagamentos pagos (duplicados)
      const { error: deletePaidPaymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'paid');
        
      if (deletePaidPaymentsError) throw deletePaidPaymentsError;
      
      // 3. Limpar transações sem categoria
      const { error: deleteUncategorizedInvoicesError } = await supabase
        .from('bank_invoices')
        .delete()
        .eq('user_id', userId)
        .is('category', null);
        
      if (deleteUncategorizedInvoicesError) throw deleteUncategorizedInvoicesError;
      
      console.log('Limpeza de registros financeiros concluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro durante a limpeza dos registros financeiros:', error);
      return false;
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      console.log(`Iniciando confirmação de pagamento para usuário: ${userId}`);

      // Primeiro, limpar registros financeiros existentes
      await cleanupUserFinancialRecords(userId);

      // Verificar se há faturas pendentes
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
      
      console.log(`Faturas pendentes encontradas: ${pendingInvoices.length}`);

      // 1. Update profile status to Ativo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'Ativo' })
        .eq('id', userId);

      if (profileError) throw profileError;
      console.log('Status do perfil atualizado para Ativo');

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
        console.log(`Assinatura ID ${subscription.id} atualizada para ativa`);
      }

      // 4. Update bank invoice status to paid (only update pending invoices)
      const { error: invoiceError } = await supabase
        .from('bank_invoices')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          category: 'Mensalidade', // Garantir que seja categorizado corretamente
          payment_method: 'PIX', // Definir método de pagamento padrão
          transaction_type: 'income' // Garantir que seja marcado como receita
        })
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (invoiceError) throw invoiceError;
      console.log('Faturas bancárias atualizadas para pagas');

      // 5. Update payments status to paid (only update pending payments)
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'PIX', // Definir método de pagamento padrão
          notes: 'Mensalidade' // Garantir descrição consistente
        })
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (paymentError) throw paymentError;
      console.log('Pagamentos atualizados para pagos');

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
