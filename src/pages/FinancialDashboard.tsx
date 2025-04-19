
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import { BarChart2, FileText, ArrowUpDown } from "lucide-react";
import CashFlowPage from "@/components/financial/CashFlowPage";

const FinancialDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || (userRole !== 'admin')) {
      navigate('/check-in');
    }
  }, [user, userRole, navigate]);

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 sm:mb-6">Gestão Financeira</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="bg-white p-2 rounded-lg shadow-sm mb-4">
          <TabsList className="w-full flex flex-wrap gap-2">
            <TabsTrigger value="overview" className="flex-1 min-w-[120px] flex items-center justify-center">
              <BarChart2 className="w-4 h-4 mr-2" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex-1 min-w-[120px] flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex-1 min-w-[120px] flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <span>Entradas e Saídas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-0">
          <SubscriptionsOverview />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4 mt-0">
          <PlansManagement />
        </TabsContent>
        
        <TabsContent value="cashflow" className="space-y-4 mt-0">
          <CashFlowPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
