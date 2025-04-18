
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart2, Users, LogOut, ClipboardCheck, Wallet } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  signOut: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  signOut,
}) => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Dashboard</h2>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 p-2">
          <Button
            variant={activeTab === "overview" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("overview")}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === "schedule" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Grade Horária
          </Button>
          <Button
            variant={activeTab === "users" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </Button>
          <Button
            variant={activeTab === "attendance" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("attendance")}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Controle de Presença
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === "financial" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("financial")}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Financeiro
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
