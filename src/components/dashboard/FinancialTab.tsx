
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import PaymentHistory from "@/components/financial/PaymentHistory";
import SubscriptionsManagement from "@/components/financial/SubscriptionsManagement";
import { Button } from "@/components/ui/button";
import { CreditCard, BarChart2, FileText, UsersRound, Plus, ArrowUpDown } from "lucide-react";
import NewPaymentDialog from "@/components/financial/NewPaymentDialog";
import CashFlowPage from "@/components/financial/CashFlowPage";

const FinancialTab = () => {
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handlePaymentCreated = () => {
    // Atualizar dados após criar um novo pagamento
    if (activeTab === "payments") {
      // Forçar atualização do PaymentHistory - poderá ser implementado através de um ref
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestão Financeira</h1>
        <Button onClick={() => setIsNewPaymentDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full md:w-auto overflow-auto">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart2 className="w-4 h-4 mr-2" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            <span>Planos</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center">
            <UsersRound className="w-4 h-4 mr-2" />
            <span>Adesões</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            <span>Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <span>Entradas e Saídas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SubscriptionsOverview />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <PlansManagement />
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionsManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentHistory />
        </TabsContent>
        
        <TabsContent value="cashflow" className="space-y-4">
          <CashFlowPage />
        </TabsContent>
      </Tabs>
      
      <NewPaymentDialog
        open={isNewPaymentDialogOpen}
        onOpenChange={setIsNewPaymentDialogOpen}
        onPaymentCreated={handlePaymentCreated}
      />
    </div>
  );
};

export default FinancialTab;
