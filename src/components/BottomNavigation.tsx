
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Calendar, BarChart2, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProfileClick = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    } else {
      onTabChange("perfil");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-10">
      <Button variant="ghost" className="flex flex-col items-center text-xs" onClick={() => onTabChange("inicio")}>
        <Home className={`h-5 w-5 ${activeTab === "inicio" ? "text-blue-600" : "text-gray-500"}`} />
        <span className={activeTab === "inicio" ? "text-blue-600" : "text-gray-500"}>Início</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center text-xs" onClick={() => onTabChange("aulas")}>
        <Calendar className={`h-5 w-5 ${activeTab === "aulas" ? "text-blue-600" : "text-gray-500"}`} />
        <span className={activeTab === "aulas" ? "text-blue-600" : "text-gray-500"}>Aulas</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center text-xs" onClick={() => onTabChange("treinos")}>
        <BarChart2 className={`h-5 w-5 ${activeTab === "treinos" ? "text-blue-600" : "text-gray-500"}`} />
        <span className={activeTab === "treinos" ? "text-blue-600" : "text-gray-500"}>Treinos</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center text-xs" onClick={handleProfileClick}>
        <UserCircle className={`h-5 w-5 ${activeTab === "perfil" ? "text-blue-600" : "text-gray-500"}`} />
        <span className={activeTab === "perfil" ? "text-blue-600" : "text-gray-500"}>Perfil</span>
      </Button>
    </div>
  );
};

export default BottomNavigation;
