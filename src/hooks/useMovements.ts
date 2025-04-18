
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
      setMovements(data || []);
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

  return {
    movements,
    loading,
    formatCurrency,
    refreshMovements: fetchMovements
  };
};
