
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, AlertTriangle, Trash2 } from "lucide-react";

export default function FinancialCleanupTool() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    deletedPaidInvoices: number;
    deletedPaidPayments: number;
    fixedUncategorized: number;
    standardizedPaymentMethods: number;
  } | null>(null);

  const handleCleanupDatabase = async () => {
    try {
      setLoading(true);
      
      // Inicializar contadores
      let deletedPaidInvoices = 0;
      let deletedPaidPayments = 0;
      let fixedUncategorized = 0;
      let standardizedPaymentMethods = 0;
      
      // 1. Obter todos os usuários com faturas pagas de maneira única
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('bank_invoices')
        .select('user_id')
        .eq('status', 'paid');
      
      if (invoicesError) throw invoicesError;
      
      // Extrair IDs de usuário únicos
      const userIds = [...new Set(invoicesData?.map(item => item.user_id) || [])];
      
      // 2. Para cada usuário com faturas, verificar duplicações
      for (const userId of userIds) {
        // Obter todas as faturas pagas para este usuário
        const { data: paidInvoices, error: paidInvoicesError } = await supabase
          .from('bank_invoices')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'paid')
          .order('payment_date', { ascending: false });
        
        if (paidInvoicesError) throw paidInvoicesError;
        
        if (paidInvoices && paidInvoices.length > 1) {
          // Manter a primeira fatura (mais recente) e excluir as demais
          const invoicesToDelete = paidInvoices.slice(1).map(inv => inv.id);
          
          const { error: deleteInvoicesError, count } = await supabase
            .from('bank_invoices')
            .delete()
            .in('id', invoicesToDelete)
            .select('count');
          
          if (deleteInvoicesError) throw deleteInvoicesError;
          
          deletedPaidInvoices += count || 0;
        }
      }
      
      // 3. Semelhante para pagamentos - obter usuários com pagamentos pagos de maneira única
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('user_id')
        .eq('status', 'paid');
      
      if (paymentsError) throw paymentsError;
      
      // Extrair IDs de usuário únicos para pagamentos
      const userPaymentIds = [...new Set(paymentsData?.map(item => item.user_id) || [])];
      
      // 4. Para cada usuário com pagamentos pagos, verificar duplicações
      for (const userId of userPaymentIds) {
        const { data: paidPayments, error: paidPaymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'paid')
          .order('payment_date', { ascending: false });
        
        if (paidPaymentsError) throw paidPaymentsError;
        
        if (paidPayments && paidPayments.length > 1) {
          // Manter o primeiro pagamento (mais recente) e excluir os demais
          const paymentsToDelete = paidPayments.slice(1).map(p => p.id);
          
          const { error: deletePaymentsError, count } = await supabase
            .from('payments')
            .delete()
            .in('id', paymentsToDelete)
            .select('count');
          
          if (deletePaymentsError) throw deletePaymentsError;
          
          deletedPaidPayments += count || 0;
        }
      }
      
      // 5. Categorizar todas as faturas sem categoria para 'Mensalidade'
      const { data: uncategorizedInvoices, error: uncategorizedError } = await supabase
        .from('bank_invoices')
        .update({ category: 'Mensalidade' })
        .is('category', null)
        .select('id');
      
      if (uncategorizedError) throw uncategorizedError;
      
      fixedUncategorized = uncategorizedInvoices?.length || 0;
      
      // 6. Padronizar método de pagamento
      const { data: standardizedInvoices, error: standardizedError } = await supabase
        .from('bank_invoices')
        .update({ payment_method: 'PIX' })
        .or('is.payment_method,null,eq.payment_method,""')
        .eq('status', 'paid')
        .select('id');
      
      if (standardizedError) throw standardizedError;
      
      standardizedPaymentMethods = standardizedInvoices?.length || 0;
      
      // Atualizar resultados
      setResults({
        deletedPaidInvoices,
        deletedPaidPayments,
        fixedUncategorized,
        standardizedPaymentMethods
      });
      
      toast.success('Sistema financeiro limpo com sucesso!');
      
    } catch (error) {
      console.error('Erro durante a limpeza do banco de dados:', error);
      toast.error('Erro ao limpar o sistema financeiro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ferramenta de Limpeza Financeira</CardTitle>
        <CardDescription>
          Esta ferramenta irá limpar e padronizar os registros financeiros no sistema,
          removendo duplicações e categorizando corretamente as transações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Esta operação irá remover faturas e pagamentos duplicados e padronizar os registros financeiros.
            É recomendado fazer um backup antes de prosseguir.
          </AlertDescription>
        </Alert>
        
        {results && (
          <div className="mt-4 p-4 border rounded-md bg-green-50">
            <h3 className="font-medium flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Limpeza concluída com sucesso
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Faturas pagas duplicadas removidas: {results.deletedPaidInvoices}</li>
              <li>• Pagamentos duplicados removidos: {results.deletedPaidPayments}</li>
              <li>• Transações sem categoria corrigidas: {results.fixedUncategorized}</li>
              <li>• Métodos de pagamento padronizados: {results.standardizedPaymentMethods}</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCleanupDatabase} 
          disabled={loading}
          className="w-full"
          variant="destructive"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando limpeza...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Registros Financeiros
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
