
import { useState, useEffect } from 'react';
import { 
  fetchFinancialPlans, 
  fetchPayments, 
  fetchCashFlow 
} from '@/api/financialApi';
import { FinancialPlan, Payment, CashFlowEntry } from '@/types';

export const useFinancialData = (activeTab: string) => {
  const [plans, setPlans] = useState<FinancialPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'plans') {
        const plansData = await fetchFinancialPlans();
        setPlans(plansData);
      } else if (activeTab === 'payments') {
        const paymentsData = await fetchPayments();
        setPayments(paymentsData);
      } else if (activeTab === 'cash-flow') {
        const cashFlowData = await fetchCashFlow();
        setCashFlow(cashFlowData);
      }
    } catch (error) {
      console.error(`Error loading ${activeTab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const refetchPayments = async () => {
    try {
      const paymentsData = await fetchPayments();
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error refetching payments:", error);
    }
  };

  const refetchCashFlow = async () => {
    try {
      const cashFlowData = await fetchCashFlow();
      setCashFlow(cashFlowData);
    } catch (error) {
      console.error("Error refetching cash flow:", error);
    }
  };

  return {
    plans,
    payments,
    cashFlow,
    loading,
    setPlans,
    setPayments,
    setCashFlow,
    refetchPayments,
    refetchCashFlow
  };
};
