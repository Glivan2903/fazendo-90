
import React, { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentsList from "@/components/financial/PaymentsList";
import PlansList from "@/components/financial/PlansList";
import CashFlow from "@/components/financial/CashFlow";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Financial = () => {
  const [activeTab, setActiveTab] = useState("payments");
  const { 
    plans, 
    payments, 
    cashFlow, 
    loading,
    refetchPayments, 
    refetchCashFlow 
  } = useFinancialData(activeTab);
  const { signOut } = useAuth();

  const handleUpdatePayment = () => {
    refetchPayments();
    refetchCashFlow();
  };

  return (
    <div className="container mx-auto p-6">
      <DashboardHeader title="Financeiro" signOut={signOut} />
      
      <div className="mb-6">
        <h2 className="text-lg text-muted-foreground">
          Gerencie pagamentos, planos e fluxo de caixa
        </h2>
      </div>
      
      <Tabs defaultValue="payments" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="cash-flow">Fluxo de Caixa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          <PaymentsList 
            payments={payments} 
            loading={loading} 
            onUpdate={handleUpdatePayment}
          />
        </TabsContent>
        
        <TabsContent value="plans">
          <PlansList plans={plans} loading={loading} />
        </TabsContent>
        
        <TabsContent value="cash-flow">
          <CashFlow entries={cashFlow} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
