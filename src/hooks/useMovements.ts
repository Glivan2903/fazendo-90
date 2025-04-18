
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMovements = (userId: string | null) => {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      if (!userId) return;

      setLoading(true);
      const { data, error } = await supabase
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

      if (error) throw error;
      
      console.log("Fetched financial movements:", data);
      
      // Processar os dados para garantir que temos um número de venda formatado
      const processedData = data?.map(item => {
        // Formatar número da venda (invoice_number)
        if (item.bank_invoice) {
          return {
            ...item,
            formattedAmount: formatCurrency(item.amount),
            formattedDueDate: formatDate(item.due_date),
            formattedPaymentDate: item.payment_date ? formatDate(item.payment_date) : null,
            bank_invoice: {
              ...item.bank_invoice,
              formattedInvoiceNumber: `#${item.bank_invoice.invoice_number.padStart(6, '0')}`,
              formattedTotalAmount: formatCurrency(item.bank_invoice.total_amount),
              formattedDiscountAmount: formatCurrency(item.bank_invoice.discount_amount)
            }
          };
        }
        
        return {
          ...item,
          formattedAmount: formatCurrency(item.amount),
          formattedDueDate: formatDate(item.due_date),
          formattedPaymentDate: item.payment_date ? formatDate(item.payment_date) : null
        };
      }) || [];
      
      setMovements(processedData);
    } catch (error) {
      console.error('Error fetching financial movements:', error);
      toast.error('Erro ao carregar movimentações financeiras');
    } finally {
      setLoading(false);
    }
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
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return {
    movements,
    loading,
    formatCurrency,
    refreshMovements: fetchMovements
  };
};
