
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import EditUserDialog from "@/components/EditUserDialog";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";

const TeacherDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, userRole } = useAuth();
  const isMobile = useIsMobile();
  const { 
    activeTab,
    setActiveTab,
    todayClasses,
    loading,
    users,
    attendance,
    scheduleClasses,
    selectedUser,
    isDialogOpen,
    setIsDialogOpen,
    userEditLoading,
    handleEditUser,
    handleSaveUser
  } = useDashboardData();
  
  useEffect(() => {
    if (userRole !== "admin" && userRole !== "coach") {
      toast.error("Você não tem permissão para acessar essa página");
      navigate("/check-in");
    }
  }, [userRole, navigate]);
  
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
          <DashboardPageHeader 
            activeTab={activeTab}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            setActiveTab={setActiveTab}
            signOut={signOut}
            loading={loading}
          />
          
          <DashboardContent
            activeTab={activeTab}
            loading={loading}
            todayClasses={todayClasses}
            scheduleClasses={scheduleClasses}
            users={users}
            attendance={attendance}
            onEditUser={handleEditUser}
          />
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
