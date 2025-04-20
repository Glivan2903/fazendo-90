
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Calendar, BarChart2, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-10 shadow-md">
      <Button 
        variant="ghost" 
        className={cn(
          "flex flex-col items-center text-xs p-1.5 rounded-md",
          activeTab === "inicio" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )} 
        onClick={() => onTabChange("inicio")}
      >
        <Home className="h-5 w-5 mb-1" />
        <span>Início</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className={cn(
          "flex flex-col items-center text-xs p-1.5 rounded-md",
          activeTab === "aulas" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )} 
        onClick={() => onTabChange("aulas")}
      >
        <Calendar className="h-5 w-5 mb-1" />
        <span>Aulas</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className={cn(
          "flex flex-col items-center text-xs p-1.5 rounded-md",
          activeTab === "treinos" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )} 
        onClick={() => onTabChange("treinos")}
      >
        <BarChart2 className="h-5 w-5 mb-1" />
        <span>Treinos</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className={cn(
          "flex flex-col items-center text-xs p-1.5 rounded-md",
          activeTab === "perfil" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )} 
        onClick={handleProfileClick}
      >
        <UserCircle className="h-5 w-5 mb-1" />
        <span>Perfil</span>
      </Button>
    </div>
  );
};

export default BottomNavigation;
