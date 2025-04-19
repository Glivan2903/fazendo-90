
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable } from './components/TransactionTable';
import { ArrowUpFromLine, ArrowDownToLine, AlertCircle } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

const CashFlowPage = () => {
  const { 
    transactions, 
    loading, 
    handleEditTransaction, 
    handleDeleteTransaction 
  } = useTransactions();

  const totalIncome = transactions
    .filter(t => t.transaction_type === 'income' && t.status === 'paid')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const pendingIncome = transactions
    .filter(t => t.transaction_type === 'income' && t.status === 'pending')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entradas Recebidas
            </CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalIncome.toFixed(2)}
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
