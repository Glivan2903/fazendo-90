
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import PaymentHistory from "@/components/financial/PaymentHistory";
import { CreditCard, BarChart2, FileText, UsersRound, ArrowUpDown } from "lucide-react";
import SubscriptionsManagement from "@/components/financial/SubscriptionsManagement";
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
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão Financeira</h1>
      
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
    </div>
  );
};

export default FinancialDashboard;
