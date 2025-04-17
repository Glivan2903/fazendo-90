
import { supabase } from "@/integrations/supabase/client";
import { FinancialPlan, Payment, CashFlowEntry } from "@/types";
import { toast } from "sonner";

// Fetch all financial plans
export const fetchFinancialPlans = async (): Promise<FinancialPlan[]> => {
  const { data, error } = await supabase
    .from('planos_financeiros')
    .select('*')
    .order('valor');

  if (error) {
    console.error('Error fetching financial plans:', error);
    toast.error('Erro ao carregar planos financeiros');
    return [];
  }

  return data;
};

// Fetch payments with associated user profiles
export const fetchPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('pagamentos')
    .select(`
      *,
      profiles (
        name,
        email,
        avatar_url
      )
    `)
    .order('data_vencimento', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    toast.error('Erro ao carregar pagamentos');
    return [];
  }

  return data;
};

// Fetch cash flow entries
export const fetchCashFlow = async (
  startDate?: string,
  endDate?: string
): Promise<CashFlowEntry[]> => {
  let query = supabase
    .from('extrato_caixa')
    .select('*')
    .order('data_movimento', { ascending: false });

  if (startDate) {
    query = query.gte('data_movimento', startDate);
  }
  if (endDate) {
    query = query.lte('data_movimento', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cash flow:', error);
    toast.error('Erro ao carregar extrato do caixa');
    return [];
  }

  return data;
};

// Create new payment
export const createPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('pagamentos')
    .insert([payment])
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    toast.error('Erro ao criar pagamento');
    return null;
  }

  toast.success('Pagamento criado com sucesso');
  return data;
};

// Update payment
export const updatePayment = async (
  id: string,
  payment: Partial<Payment>
): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('pagamentos')
    .update(payment)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment:', error);
    toast.error('Erro ao atualizar pagamento');
    return null;
  }

  toast.success('Pagamento atualizado com sucesso');
  return data;
};

// Delete payment
export const deletePayment = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pagamentos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting payment:', error);
    toast.error('Erro ao excluir pagamento');
    return false;
  }

  toast.success('Pagamento excluído com sucesso');
  return true;
};

// Create cash flow entry
export const createCashFlowEntry = async (
  entry: Omit<CashFlowEntry, 'id'>
): Promise<CashFlowEntry | null> => {
  const { data, error } = await supabase
    .from('extrato_caixa')
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error('Error creating cash flow entry:', error);
    toast.error('Erro ao criar lançamento no caixa');
    return null;
  }

  toast.success('Lançamento criado com sucesso');
  return data;
};

