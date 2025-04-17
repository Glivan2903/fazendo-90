
import React, { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentsList from "@/components/financial/PaymentsList";
import PlansList from "@/components/financial/PlansList";
import CashFlow from "@/components/financial/CashFlow";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const Financial = () => {
  const [activeTab, setActiveTab] = useState("payments");
  const { plans, payments, cashFlow, loading } = useFinancialData(activeTab);

  return (
    <div className="container mx-auto p-6">
      <DashboardHeader heading="Financeiro" text="Gerencie pagamentos, planos e fluxo de caixa" />
      
      <Tabs defaultValue="payments" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="cash-flow">Fluxo de Caixa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments">
          <PaymentsList payments={payments} loading={loading} />
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
