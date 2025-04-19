
import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface CheckInHeaderProps {
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const CheckInHeader: React.FC<CheckInHeaderProps> = ({ onTabChange, onSignOut }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <header className="py-6 flex justify-between items-center">
      <div className="flex-1"></div>
      <div className="text-center flex-1">
        <h1 className="font-bold text-xl">Bem-vindo à Cross Box Fênix</h1>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => onTabChange("aulas")}>
            Check-in
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer text-red-500" onClick={onSignOut}>
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default CheckInHeader;
