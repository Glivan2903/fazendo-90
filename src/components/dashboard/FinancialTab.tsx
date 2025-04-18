
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import PaymentHistory from "@/components/financial/PaymentHistory";
import SubscriptionsManagement from "@/components/financial/SubscriptionsManagement";
import { CreditCard, BarChart2, FileText, UsersRound } from "lucide-react";

const FinancialTab = () => {
  return (
    <div className="container mx-auto">
      <Tabs defaultValue="overview" className="space-y-4">
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
      </Tabs>
    </div>
  );
};

export default FinancialTab;
