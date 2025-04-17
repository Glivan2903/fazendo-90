
import React from "react";
import { Loader2 } from "lucide-react";
import DashboardMobileMenu from "./DashboardMobileMenu";

interface DashboardPageHeaderProps {
  activeTab: string;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  signOut: () => void;
  loading?: boolean;
}

const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  activeTab,
  menuOpen,
  setMenuOpen,
  setActiveTab,
  signOut,
  loading
}) => {
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Visão Geral";
      case "schedule":
        return "Grade Horária";
      case "programs":
        return "Programas";
      case "users":
        return "Usuários";
      case "attendance":
        return "Controle de Presença";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex items-center p-4 border-b bg-white">
      <DashboardMobileMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        signOut={signOut}
      />
      <h1 className="text-xl font-bold ml-2">
        {getHeaderTitle()}
        {loading && activeTab !== "overview" && (
          <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin text-blue-500" />
        )}
      </h1>
    </div>
  );
};

export default DashboardPageHeader;
