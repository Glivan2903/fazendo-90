
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import { BarChart2, FileText } from "lucide-react";
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
    <div className="w-full min-h-screen px-2 sm:px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2">Gestão Financeira</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="bg-white p-2 rounded-lg shadow-sm mb-4 w-[95%] sm:w-full mx-auto">
          <TabsList className="w-full grid grid-cols-2 gap-2">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <BarChart2 className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Planos</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-0 w-[95%] sm:w-full mx-auto">
          <SubscriptionsOverview />
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4 mt-0 w-[95%] sm:w-full mx-auto">
          <PlansManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
