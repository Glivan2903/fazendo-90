
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface DashboardMobileMenuProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  signOut: () => void;
}

const DashboardMobileMenu: React.FC<DashboardMobileMenuProps> = ({
  menuOpen,
  setMenuOpen,
  activeTab,
  setActiveTab,
  signOut
}) => {
  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <DashboardSidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMenuOpen(false);
          }}
          signOut={signOut}
        />
      </SheetContent>
    </Sheet>
  );
};

export default DashboardMobileMenu;
