
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable } from './components/TransactionTable';
import { ArrowUpFromLine, ArrowDownToLine, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from "@/components/ui/button";
import { NewExpenseDialog } from './components/dialogs/NewExpenseDialog';
import { NewIncomeDialog } from './components/dialogs/NewIncomeDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CashFlowPage = () => {
  const { 
    transactions, 
    loading, 
    handleEditTransaction, 
    handleDeleteTransaction,
    fetchTransactions
  } = useTransactions();

  const [totalPaidIncome, setTotalPaidIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [pendingIncome, setPendingIncome] = useState(0);
  const [paidAndPendingIncome, setPaidAndPendingIncome] = useState(0);
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
  const [isNewIncomeDialogOpen, setIsNewIncomeDialogOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [expenseFormValues, setExpenseFormValues] = useState({
    date: new Date(),
    fornecedor: '',
    description: '',
    category: '',
    amount: '',
    status: 'paid',
    payment_method: 'pix',
    bank_account: 'Nubank'
  });
  const [incomeFormValues, setIncomeFormValues] = useState({
    date: new Date(),
    buyer_name: '',
    user_id: '',
    description: '',
    category: '',
    amount: '',
    status: 'paid',
    payment_method: 'pix',
    bank_account: 'Nubank'
  });

  useEffect(() => {
    // Calculate totals when transactions change
    const paid = transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'paid')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const expenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const pending = transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'pending')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const total = paid + pending;
    
    setTotalPaidIncome(paid);
    setTotalExpenses(expenses);
    setPendingIncome(pending);
    setPaidAndPendingIncome(total);
  }, [transactions]);

  useEffect(() => {
    fetchSuppliers();
    fetchUsers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Erro ao carregar fornecedores');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const handleExpenseFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormValues({
      ...expenseFormValues,
      [name]: value
    });
  };

  const handleIncomeFormChange = (e) => {
    const { name, value } = e.target;
    setIncomeFormValues({
      ...incomeFormValues,
      [name]: value
    });
  };

  const handleExpenseSelectChange = (name, value) => {
    setExpenseFormValues({
      ...expenseFormValues,
      [name]: value
    });
  };

  const handleIncomeSelectChange = (name, value) => {
    setIncomeFormValues({
      ...incomeFormValues,
      [name]: value
    });
  };

  const handleExpenseDateChange = (date) => {
    setExpenseFormValues({
      ...expenseFormValues,
      date: date
    });
    setCalendarOpen(false);
  };

  const handleIncomeDateChange = (date) => {
    setIncomeFormValues({
      ...incomeFormValues,
      date: date
    });
    setCalendarOpen(false);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const newExpense = {
        date: expenseFormValues.date.toISOString(),
        fornecedor: expenseFormValues.fornecedor,
        description: expenseFormValues.description,
        category: expenseFormValues.category,
        amount: Number(expenseFormValues.amount),
        status: expenseFormValues.status,
        payment_method: expenseFormValues.payment_method,
        bank_account: expenseFormValues.bank_account,
        transaction_type: 'expense'
      };

      const { error } = await supabase
        .from('transactions')
        .insert([newExpense]);

      if (error) throw error;

      toast.success('Despesa adicionada com sucesso!');
      setIsNewExpenseDialogOpen(false);
      fetchTransactions();
      
      // Reset form
      setExpenseFormValues({
        date: new Date(),
        fornecedor: '',
        description: '',
        category: '',
        amount: '',
        status: 'paid',
        payment_method: 'pix',
        bank_account: 'Nubank'
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Erro ao adicionar despesa');
    }
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    try {
      const newIncome = {
        date: incomeFormValues.date.toISOString(),
        buyer_name: incomeFormValues.buyer_name,
        user_id: incomeFormValues.user_id,
        description: incomeFormValues.description,
        category: incomeFormValues.category,
        amount: Number(incomeFormValues.amount),
        status: incomeFormValues.status,
        payment_method: incomeFormValues.payment_method,
        bank_account: incomeFormValues.bank_account,
        transaction_type: 'income'
      };

      const { error } = await supabase
        .from('transactions')
        .insert([newIncome]);

      if (error) throw error;

      toast.success('Receita adicionada com sucesso!');
      setIsNewIncomeDialogOpen(false);
      fetchTransactions();
      
      // Reset form
      setIncomeFormValues({
        date: new Date(),
        buyer_name: '',
        user_id: '',
        description: '',
        category: '',
        amount: '',
        status: 'paid',
        payment_method: 'pix',
        bank_account: 'Nubank'
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Erro ao adicionar receita');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fluxo de Caixa</h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center" 
            onClick={() => setIsNewExpenseDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Despesa
          </Button>
          <Button 
            size="sm" 
            className="flex items-center" 
            onClick={() => setIsNewIncomeDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Receita
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entradas Recebidas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPaidIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saídas
            </CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entradas Pendentes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R$ {pendingIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Total
            </CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {paidAndPendingIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable 
            transactions={transactions}
            loading={loading}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </CardContent>
      </Card>

      <NewExpenseDialog 
        isOpen={isNewExpenseDialogOpen}
        onClose={() => setIsNewExpenseDialogOpen(false)}
        onSubmit={handleExpenseSubmit}
        formValues={expenseFormValues}
        handleFormChange={handleExpenseFormChange}
        handleSelectChange={handleExpenseSelectChange}
        handleDateChange={handleExpenseDateChange}
        suppliers={suppliers}
        calendarOpen={calendarOpen}
        setCalendarOpen={setCalendarOpen}
        fetchSuppliers={fetchSuppliers}
      />

      <NewIncomeDialog
        isOpen={isNewIncomeDialogOpen}
        onClose={() => setIsNewIncomeDialogOpen(false)}
        onSubmit={handleIncomeSubmit}
        formValues={incomeFormValues}
        handleFormChange={handleIncomeFormChange}
        handleSelectChange={handleIncomeSelectChange}
        handleDateChange={handleIncomeDateChange}
        calendarOpen={calendarOpen}
        setCalendarOpen={setCalendarOpen}
        users={users}
      />
    </div>
  );
};

export default CashFlowPage;
