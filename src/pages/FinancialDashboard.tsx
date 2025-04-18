
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import PaymentHistory from "@/components/financial/PaymentHistory";

const FinancialDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || (userRole !== 'admin')) {
      navigate('/check-in');
    }
  }, [user, userRole, navigate]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão Financeira</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SubscriptionsOverview />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <PlansManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
