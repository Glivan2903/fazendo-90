
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Transaction, Supplier } from '../types';
import { format } from 'date-fns';
import { BankInvoiceTable } from '../types/database.types';

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
      
      const formattedData = (data as BankInvoiceTable[]).map(item => ({
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
      setFilteredTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // First try to fetch from the suppliers table
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');
      
      if (suppliersError) {
        console.error('Error fetching suppliers:', suppliersError);
        
        // Fallback to using profiles with supplier role
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'supplier')
          .order('name');
        
        if (profilesError) {
          console.error('Error fetching supplier profiles:', profilesError);
          setSuppliers([]);
          return;
        }
        
        if (profilesData) {
          setSuppliers(profilesData);
        } else {
          setSuppliers([]);
        }
      } else if (suppliersData) {
        setSuppliers(suppliersData);
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
    fetchSuppliers,
    setTransactions
  };
};
