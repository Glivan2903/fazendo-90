
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManagement from "@/components/financial/PlansManagement";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";
import PaymentHistory from "@/components/financial/PaymentHistory";
import { CreditCard, BarChart2, FileText, UsersRound, ArrowUpDown, Menu } from "lucide-react";
import SubscriptionsManagement from "@/components/financial/SubscriptionsManagement";
import CashFlowPage from "@/components/financial/CashFlowPage";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const FinancialDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");

  React.useEffect(() => {
    if (!user || (userRole !== 'admin')) {
      navigate('/check-in');
    }
  }, [user, userRole, navigate]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestão Financeira</h1>
        
        {isMobile && (
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="flex flex-col h-full">
                <div className="border-b p-4">
                  <h2 className="text-xl font-bold">Menu Financeiro</h2>
                </div>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("overview");
                          setMenuOpen(false);
                        }}
                      >
                        <BarChart2 className="mr-2 h-5 w-5" />
                        Visão Geral
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("plans");
                          setMenuOpen(false);
                        }}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        Planos
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("subscriptions");
                          setMenuOpen(false);
                        }}
                      >
                        <UsersRound className="mr-2 h-5 w-5" />
                        Adesões
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("payments");
                          setMenuOpen(false);
                        }}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pagamentos
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("cashflow");
                          setMenuOpen(false);
                        }}
                      >
                        <ArrowUpDown className="mr-2 h-5 w-5" />
                        Entradas e Saídas
                      </Button>
                    </li>
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={isMobile ? "grid grid-cols-1 md:grid-cols-5 md:w-auto overflow-auto hidden" : "w-full md:w-auto overflow-auto"}>
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

        {isMobile && (
          <div className="flex justify-between items-center overflow-auto py-2 mb-4 bg-gray-100 rounded-md">
            <Button 
              variant={activeTab === "overview" ? "default" : "ghost"} 
              size="sm"
              className="flex-shrink-0"
              onClick={() => setActiveTab("overview")}
            >
              <BarChart2 className="w-4 h-4" />
            </Button>
            <Button 
              variant={activeTab === "plans" ? "default" : "ghost"} 
              size="sm"
              className="flex-shrink-0"
              onClick={() => setActiveTab("plans")}
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button 
              variant={activeTab === "subscriptions" ? "default" : "ghost"} 
              size="sm"
              className="flex-shrink-0"
              onClick={() => setActiveTab("subscriptions")}
            >
              <UsersRound className="w-4 h-4" />
            </Button>
            <Button 
              variant={activeTab === "payments" ? "default" : "ghost"} 
              size="sm"
              className="flex-shrink-0"
              onClick={() => setActiveTab("payments")}
            >
              <CreditCard className="w-4 h-4" />
            </Button>
            <Button 
              variant={activeTab === "cashflow" ? "default" : "ghost"} 
              size="sm"
              className="flex-shrink-0"
              onClick={() => setActiveTab("cashflow")}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        )}

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
