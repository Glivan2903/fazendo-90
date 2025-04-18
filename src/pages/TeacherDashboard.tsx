import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import EditUserDialog from "@/components/EditUserDialog";
import { User } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { updateUser } from "@/api/userApi";
import { toast } from "sonner";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { FinancialMetrics } from "@/components/financial/FinancialMetrics";
import PlansManagement from "@/components/financial/PlansManagement";
import PaymentHistory from "@/components/financial/PaymentHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionsOverview from "@/components/financial/SubscriptionsOverview";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userEditLoading, setUserEditLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardSection, setDashboardSection] = useState("administrativo");
  const [financialTab, setFinancialTab] = useState("overview");
  
  const navigate = useNavigate();
  const { signOut, userRole, user } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    todayClasses,
    loading,
    users,
    attendance,
    scheduleClasses,
    setUsers
  } = useDashboardData(activeTab);
  
  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    console.log("TeacherDashboard: Current user role:", userRole);
    
    if (userRole !== null && userRole !== "admin" && userRole !== "coach") {
      console.log(`Usuário com role ${userRole} tentando acessar o dashboard`);
      toast.error("Você não tem permissão para acessar essa página");
      navigate("/check-in");
    }
  }, [userRole, navigate, user]);
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  const handleSaveUser = async (userData: User) => {
    if (!selectedUser) return;
    
    setUserEditLoading(true);
    try {
      const updatedUser = await updateUser(userData);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsDialogOpen(false);
      toast.success("Usuário atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setUserEditLoading(false);
    }
  };

  const renderDashboardContent = () => {
    switch (dashboardSection) {
      case "administrativo":
        return (
          <DashboardContent
            activeTab={activeTab}
            loading={loading}
            todayClasses={todayClasses}
            scheduleClasses={scheduleClasses}
            users={users}
            attendance={attendance}
            onEditUser={handleEditUser}
          />
        );
      case "financeiro":
        return renderFinancialContent();
      case "tecnico":
        return <div className="p-4 bg-white rounded-lg">Conteúdo técnico em desenvolvimento</div>;
      default:
        return null;
    }
  };

  const renderFinancialContent = () => {
    return (
      <div className="space-y-6">
        <FinancialMetrics />
        
        <div className="bg-white p-4 rounded-lg">
          <Tabs defaultValue={financialTab} onValueChange={setFinancialTab} className="space-y-4">
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
      </div>
    );
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar className="hidden md:block">
          <DashboardSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            signOut={signOut}
          />
        </Sidebar>
        
        <main className="flex-1 overflow-auto">
          <div className="flex items-center p-4 border-b bg-white">
            {isMobile && (
              <MobileMenu
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                signOut={signOut}
              />
            )}
            <h1 className="text-xl font-bold ml-2">Dashboard</h1>
          </div>
          
          <div className="p-4">
            <div className="mb-6">
              <DashboardTabs 
                activeTab={dashboardSection} 
                onTabChange={setDashboardSection} 
              />
            </div>

            {renderDashboardContent()}
          </div>
        </main>
        
        <EditUserDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          user={selectedUser}
          onSave={handleSaveUser}
          isLoading={userEditLoading}
        />
      </div>
    </SidebarProvider>
  );
};

export default TeacherDashboard;
