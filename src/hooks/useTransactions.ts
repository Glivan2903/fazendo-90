
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Transaction } from '@/components/financial/types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch transactions from the database
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_invoices')
        .select('*')
        .order('due_date', { ascending: false });
        
      if (error) throw error;
      
      // Type-safe mapping with explicit casting for transaction_type
      const formattedData = data.map(item => ({
        id: item.id,
        date: item.due_date,
        category: item.category || 'Sem categoria',
        description: item.description || item.buyer_name || 'Sem descrição',
        amount: item.total_amount,
        status: item.status,
        payment_method: item.payment_method || 'Não definido',
        fornecedor: item.fornecedor || null,
        bank_account: item.bank_account || 'Conta Principal',
        transaction_type: (item.transaction_type === 'income' || item.transaction_type === 'expense') 
          ? item.transaction_type 
          : 'income' as 'income' | 'expense', // Default to 'income' if invalid value
        buyer_name: item.buyer_name
      })) as Transaction[];
      
      setTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  // Update transaction
  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    try {
      const { error } = await supabase
        .from('bank_invoices')
        .update({
          due_date: updatedTransaction.date,
          category: updatedTransaction.category,
          description: updatedTransaction.description,
          total_amount: updatedTransaction.amount,
          status: updatedTransaction.status,
          payment_method: updatedTransaction.payment_method,
          fornecedor: updatedTransaction.fornecedor,
          bank_account: updatedTransaction.bank_account
        })
        .eq('id', updatedTransaction.id);
        
      if (error) throw error;
      
      // Update local state
      setTransactions(transactions.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
      ));
      
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      toast.success('Transação atualizada com sucesso');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      const { error } = await supabase
        .from('bank_invoices')
        .delete()
        .eq('id', transaction.id);
        
      if (error) throw error;
      
      // Update the local state after successful deletion
      setTransactions(transactions.filter(t => t.id !== transaction.id));
      toast.success('Transação excluída com sucesso');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir transação');
    }
  };

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    handleEditTransaction,
    handleDeleteTransaction,
    fetchTransactions,
    editingTransaction,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleUpdateTransaction
  };
};
