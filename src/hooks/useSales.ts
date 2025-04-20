
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sale, SaleItem, SalePayment } from '@/types/sales';

export const useSales = (userId?: string) => {
  const { data: sales, isLoading, refetch } = useQuery({
    queryKey: ['sales', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          *,
          sales_items (*),
          sales_payments (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return salesData.map((sale: any) => ({
        ...sale,
        items: sale.sales_items,
        payments: sale.sales_payments
      }));
    },
    enabled: !!userId
  });

  return {
    sales,
    isLoading,
    refetch
  };
};
