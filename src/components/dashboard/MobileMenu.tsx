
import React from "react";
import { Menu, X, LayoutDashboard, Calendar, Users, UserCheck, Clock, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  signOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  menuOpen,
  setMenuOpen,
  activeTab,
  setActiveTab,
  signOut
}) => {
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };
  
  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex flex-col h-full">
          <div className="border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">CrossBox Fênix</h2>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeTab === "overview" && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleTabChange("overview")}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Visão Geral
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeTab === "schedule" && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleTabChange("schedule")}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Grade Horária
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeTab === "users" && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleTabChange("users")}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Usuários
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeTab === "attendance" && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleTabChange("attendance")}
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Presença
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/check-in'}
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Check-in
                </Button>
              </li>
            </ul>
          </nav>
          
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
