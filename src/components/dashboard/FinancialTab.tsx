
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import { BarChart2, FileText, ArrowUpDown } from "lucide-react";
import CashFlowPage from "@/components/financial/CashFlowPage";
import { Card } from '@/components/ui/card';

const FinancialTab = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestão Financeira</h1>
      </div>
      
      <Card className="p-4 mb-6">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full md:w-auto overflow-auto bg-white border rounded-md p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger 
              value="plans" 
              className="flex items-center data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cashflow" 
              className="flex items-center data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <span>Entradas e Saídas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <SubscriptionsOverview />
          </TabsContent>

          <TabsContent value="plans" className="space-y-4 mt-6">
            <PlansManagement />
          </TabsContent>
          
          <TabsContent value="cashflow" className="space-y-4 mt-6">
            <CashFlowPage />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default FinancialTab;
