
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  LayoutDashboard,
  Clock,
  UserCheck,
  LogOut,
  CalendarDays
} from "lucide-react";
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  signOut: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  signOut 
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold">CrossBox Fênix</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setActiveTab("overview")} isActive={activeTab === "overview"}>
              <LayoutDashboard size={20} />
              <span>Visão Geral</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setActiveTab("schedule")} isActive={activeTab === "schedule"}>
              <Calendar size={20} />
              <span>Grade Horária</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setActiveTab("users")} isActive={activeTab === "users"}>
              <Users size={20} />
              <span>Usuários</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setActiveTab("attendance")} isActive={activeTab === "attendance"}>
              <UserCheck size={20} />
              <span>Presença</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/schedule-editor")}>
              <CalendarDays size={20} />
              <span>Editor de Grade</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/check-in")}>
              <Clock size={20} />
              <span>Check-in</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </>
  );
};

export default DashboardSidebar;
