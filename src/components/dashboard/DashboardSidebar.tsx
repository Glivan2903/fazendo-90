import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart2, Users, CreditCard, LogOut } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

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
  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
        <div className="space-y-1">
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
            variant={activeTab === "financial" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("financial")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Financeiro
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
