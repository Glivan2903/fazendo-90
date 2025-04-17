
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Users, LayoutDashboard, Clock, UserCheck, 
  LogOut, CalendarDays, ListFilter
} from "lucide-react";
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  
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
            <Collapsible
              open={scheduleOpen || activeTab === "schedule" || activeTab === "programs"}
              onOpenChange={setScheduleOpen}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={activeTab === "schedule" || activeTab === "programs"}>
                  <Calendar size={20} />
                  <span className="flex-1">Grade Horária</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("h-4 w-4 transition-transform", scheduleOpen && "rotate-180")}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 pr-2 py-1 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    activeTab === "schedule" && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => setActiveTab("schedule")}
                >
                  <CalendarDays size={16} className="mr-2" />
                  Grade horária
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    activeTab === "programs" && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => setActiveTab("programs")}
                >
                  <ListFilter size={16} className="mr-2" />
                  Programas
                </Button>
              </CollapsibleContent>
            </Collapsible>
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
