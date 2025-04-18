
import React from 'react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

const tabs = [
  {
    name: "ADMINISTRATIVO",
    path: "/teacher-dashboard"
  },
  {
    name: "FINANCEIRO",
    path: "/financial"
  },
  {
    name: "TÉCNICO",
    path: "/technical"
  }
];

const DashboardTabs = ({ activeTab }: { activeTab: string }) => {
  const navigate = useNavigate();

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-6">
        {tabs.map((tab) => (
          <NavigationMenuItem key={tab.name}>
            <NavigationMenuLink
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                activeTab === tab.name.toLowerCase() ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"
              )}
              onClick={() => navigate(tab.path)}
            >
              {tab.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default DashboardTabs;
