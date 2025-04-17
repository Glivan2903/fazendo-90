
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const ClassDetailHeader = () => {
  const navigate = useNavigate();
  const { userRole, signOut } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="py-6 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleGoBack}
        className="rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <h1 className="text-2xl font-bold flex-1 text-center">Detalhes da Aula</h1>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate("/check-in")}
          >
            Check-in
          </DropdownMenuItem>
          
          {(userRole === "admin" || userRole === "coach") && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/schedule-editor")}
              >
                Editor de Grade
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem
            className="cursor-pointer text-red-500"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default ClassDetailHeader;
