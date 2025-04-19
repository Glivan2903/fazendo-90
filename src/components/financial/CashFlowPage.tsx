
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable } from './components/TransactionTable';
import { ArrowUpFromLine, ArrowDownToLine, AlertCircle, CheckCircle } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

const CashFlowPage = () => {
  const { 
    transactions, 
    loading, 
    handleEditTransaction, 
    handleDeleteTransaction 
  } = useTransactions();

  const [totalPaidIncome, setTotalPaidIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [pendingIncome, setPendingIncome] = useState(0);
  const [paidAndPendingIncome, setPaidAndPendingIncome] = useState(0);

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

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default CashFlowPage;
