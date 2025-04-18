
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Transaction, Supplier } from '../types';
import { format } from 'date-fns';

export const useCashFlow = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<{id: string, name: string, email: string}[]>([]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_invoices')
        .select('*')
        .order('due_date', { ascending: false });
        
      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        date: item.due_date,
        category: item.category || 'Sem categoria',
        description: item.buyer_name || 'Sem descrição',
        amount: item.total_amount,
        status: item.status,
        payment_method: item.payment_method || 'Não definido',
        fornecedor: item.fornecedor || null,
        bank_account: item.bank_account || 'Conta Principal',
        transaction_type: item.transaction_type || 'income',
        buyer_name: item.buyer_name
      }));
      
      setTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'supplier')
        .order('name');
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        setSuppliers([]);
        return;
      }
      
      if (data) {
        setSuppliers(data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');
        
      if (error) throw error;
      if (data) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchSuppliers();
    fetchUsers();
  }, []);

  return {
    transactions,
    filteredTransactions,
    setFilteredTransactions,
    loading,
    suppliers,
    users,
    fetchTransactions,
    setTransactions
  };
};
