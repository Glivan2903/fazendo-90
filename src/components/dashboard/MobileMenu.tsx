
import React from "react";
import { Menu, X, LayoutDashboard, Calendar, Users, UserCheck, Clock, LogOut, CreditCard, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <div className="flex flex-col h-full">
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">CrossBox Fênix</h2>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || 'User'} />
                <AvatarFallback>{getInitials(user?.user_metadata?.name || 'User')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.user_metadata?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
              </div>
            </div>
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
                  className={cn(
                    "w-full justify-start",
                    activeTab === "check-in" && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => navigate("/check-in")}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Check-in
                </Button>
              </li>
              {(userRole === "admin") && (
                <li>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      activeTab === "financial" && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleTabChange("financial")}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Financeiro
                  </Button>
                </li>
              )}
            </ul>
          </nav>
          
          <div className="border-t p-4 mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
              onClick={signOut}
            >
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
