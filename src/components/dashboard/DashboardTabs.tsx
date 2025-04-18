
import React from 'react';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const tabs = [
  {
    name: "ADMINISTRATIVO",
    value: "administrativo"
  },
  {
    name: "FINANCEIRO",
    value: "financeiro"
  },
  {
    name: "TÉCNICO",
    value: "tecnico"
  }
];

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-6">
        {tabs.map((tab) => (
          <NavigationMenuItem key={tab.name}>
            <NavigationMenuLink
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                activeTab === tab.value ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"
              )}
              onClick={() => onTabChange(tab.value)}
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
