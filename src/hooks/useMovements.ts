
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FinancialMovement {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_date: string | null;
  due_date: string;
  reference: string | null;
  notes: string | null;
  bank_invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    discount_amount: number;
  } | null;
  formattedAmount: string;
  formattedDueDate: string;
  formattedPaymentDate: string | null;
}

export const useMovements = (userId: string | null) => {
  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMovements = async () => {
    try {
      if (!userId) {
        setMovements([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      // Buscar pagamentos do usuário
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          bank_invoice:bank_invoices (
            *,
            bank_invoice_items (*)
          )
        `)
        .eq('user_id', userId)
        .order('due_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      
      // Buscar faturas que não têm pagamentos associados
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('bank_invoices')
        .select('*')
        .eq('user_id', userId)
        .not('id', 'in', `(${paymentsData.filter(p => p.bank_invoice_id).map(p => `'${p.bank_invoice_id}'`).join(',') || 'null'})`)
        .order('due_date', { ascending: false });
        
      if (invoicesError) throw invoicesError;
      
      // Processar pagamentos
      const processedPayments = paymentsData?.map(processPaymentData) || [];
      
      // Processar faturas sem pagamentos e convertê-las para o formato de movimento
      const processedInvoices = invoicesData?.map(invoice => {
        // Criar um movimento fictício para representar a fatura
        const movement: FinancialMovement = {
          id: `invoice-${invoice.id}`,
          user_id: invoice.user_id,
          subscription_id: null,
          amount: invoice.total_amount,
          status: invoice.status,
          payment_method: invoice.payment_method,
          payment_date: invoice.payment_date,
          due_date: invoice.due_date,
          reference: invoice.invoice_number,
          notes: `Fatura #${invoice.invoice_number}`,
          bank_invoice: {
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            total_amount: invoice.total_amount,
            discount_amount: invoice.discount_amount || 0
          },
          formattedAmount: formatCurrency(invoice.total_amount),
          formattedDueDate: formatDate(invoice.due_date),
          formattedPaymentDate: invoice.payment_date ? formatDate(invoice.payment_date) : null
        };
        
        return movement;
      }) || [];
      
      // Mesclar pagamentos e faturas em uma única lista
      const allMovements = [...processedPayments, ...processedInvoices]
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
      
      setMovements(allMovements);
    } catch (error) {
      console.error('Error fetching financial movements:', error);
      setError(error instanceof Error ? error : new Error('Erro ao carregar movimentações financeiras'));
      toast.error('Erro ao carregar movimentações financeiras');
    } finally {
      setLoading(false);
    }
  };

  const processPaymentData = (item: any): FinancialMovement => {
    return {
      ...item,
      formattedAmount: formatCurrency(item.amount),
      formattedDueDate: formatDate(item.due_date),
      formattedPaymentDate: item.payment_date ? formatDate(item.payment_date) : null,
      bank_invoice: item.bank_invoice ? {
        ...item.bank_invoice,
        formattedInvoiceNumber: `#${item.bank_invoice.invoice_number.padStart(6, '0')}`,
        formattedTotalAmount: formatCurrency(item.bank_invoice.total_amount),
        formattedDiscountAmount: formatCurrency(item.bank_invoice.discount_amount || 0)
      } : null
    };
  };

  useEffect(() => {
    fetchMovements();
  }, [userId]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  return {
    movements,
    loading,
    error,
    formatCurrency,
    formatDate,
    refreshMovements: fetchMovements
  };
};
