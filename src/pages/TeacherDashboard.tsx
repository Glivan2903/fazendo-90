
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Loader2, Menu } from "lucide-react";
import { fetchClasses } from "../api/classApi";
import { fetchUsers, updateUser } from "@/api/userApi";
import { fetchAttendance } from "@/api/attendanceApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import EditUserDialog from "@/components/EditUserDialog";
import { Class, User } from "../types";
import { addDays } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

// Import the component files
import OverviewTab from "@/components/dashboard/OverviewTab";
import ScheduleTab from "@/components/dashboard/ScheduleTab";
import ProgramsTab from "@/components/dashboard/ProgramsTab";
import UsersTab from "@/components/dashboard/UsersTab";
import AttendanceTab from "@/components/dashboard/AttendanceTab";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [todayClasses, setTodayClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [scheduleClasses, setScheduleClasses] = useState<Class[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userEditLoading, setUserEditLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, userRole, user } = useAuth();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Redirect if not admin or coach
    if (!user) {
      navigate("/auth");
      return;
    }
    
    console.log("TeacherDashboard: Current user role:", userRole);
    
    // Verificamos se o userRole está definido e não é admin ou coach
    if (userRole !== null && userRole !== "admin" && userRole !== "coach") {
      console.log(`Usuário com role ${userRole} tentando acessar o dashboard`);
      toast.error("Você não tem permissão para acessar essa página");
      navigate("/check-in");
    }
  }, [userRole, navigate, user]);
  
  useEffect(() => {
    const fetchTodayClasses = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const classes = await fetchClasses(today);
        setTodayClasses(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Erro ao carregar aulas de hoje");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayClasses();
  }, []);
  
  useEffect(() => {
    if (activeTab === "schedule") {
      const fetchWeeklySchedule = async () => {
        setLoading(true);
        try {
          const today = new Date();
          let allClasses: Class[] = [];
          
          for (let i = 0; i < 7; i++) {
            const date = addDays(today, i);
            const classes = await fetchClasses(date);
            allClasses = [...allClasses, ...classes];
          }
          
          setScheduleClasses(allClasses);
        } catch (error) {
          console.error("Error fetching weekly schedule:", error);
          toast.error("Erro ao carregar grade horária");
        } finally {
          setLoading(false);
        }
      };
      
      fetchWeeklySchedule();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "users") {
      const loadUsers = async () => {
        setLoading(true);
        try {
          const userData = await fetchUsers();
          setUsers(userData);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Erro ao carregar usuários");
        } finally {
          setLoading(false);
        }
      };
      
      loadUsers();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "attendance") {
      const loadAttendance = async () => {
        setLoading(true);
        try {
          const attendanceData = await fetchAttendance();
          setAttendance(attendanceData);
        } catch (error) {
          console.error("Error fetching attendance:", error);
          toast.error("Erro ao carregar dados de presença");
        } finally {
          setLoading(false);
        }
      };
      
      loadAttendance();
    }
  }, [activeTab]);
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  const handleSaveUser = async (userData: User) => {
    if (!selectedUser) return;
    
    setUserEditLoading(true);
    try {
      await updateUser(userData);
      setUsers(users.map(u => u.id === userData.id ? userData : u));
      toast.success("Usuário atualizado com sucesso!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setUserEditLoading(false);
    }
  };
  
  const MobileMenu = () => (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <DashboardSidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMenuOpen(false);
          }}
          signOut={signOut}
        />
      </SheetContent>
    </Sheet>
  );
  
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
            {isMobile && <MobileMenu />}
            <h1 className="text-xl font-bold ml-2">
              {activeTab === "overview" && "Visão Geral"}
              {activeTab === "schedule" && "Grade Horária"}
              {activeTab === "programs" && "Programas"}
              {activeTab === "users" && "Usuários"}
              {activeTab === "attendance" && "Controle de Presença"}
            </h1>
          </div>
          
          <div className="p-4">
            {loading && activeTab !== "overview" && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            )}
            
            {activeTab === "overview" && (
              <OverviewTab classes={todayClasses} loading={loading} />
            )}
            
            {activeTab === "schedule" && !loading && (
              <ScheduleTab classes={scheduleClasses} />
            )}

            {activeTab === "programs" && (
              <ProgramsTab />
            )}
            
            {activeTab === "users" && !loading && (
              <UsersTab users={users} onEditUser={handleEditUser} />
            )}
            
            {activeTab === "attendance" && !loading && (
              <AttendanceTab attendanceData={attendance} />
            )}
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
