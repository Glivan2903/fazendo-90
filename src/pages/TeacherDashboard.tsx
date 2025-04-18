
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

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userEditLoading, setUserEditLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
            <h1 className="text-xl font-bold ml-2">
              {activeTab === "overview" && "Visão Geral"}
              {activeTab === "schedule" && "Grade Horária"}
              {activeTab === "programs" && "Programas"}
              {activeTab === "users" && "Usuários"}
              {activeTab === "attendance" && "Controle de Presença"}
            </h1>
          </div>
          
          <div className="p-4">
            <DashboardContent
              activeTab={activeTab}
              loading={loading}
              todayClasses={todayClasses}
              scheduleClasses={scheduleClasses}
              users={users}
              attendance={attendance}
              onEditUser={handleEditUser}
            />
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
