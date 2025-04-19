
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardTab from "../tabs/DashboardTab";
import ClassesTab from "../tabs/ClassesTab";
import TrainingTab from "../tabs/TrainingTab";
import ProfileTab from "../tabs/ProfileTab";
import LoadingSpinner from "../LoadingSpinner";
import { Class } from "@/types";

interface CheckInTabsProps {
  activeTab: string;
  loading: boolean;
  classes: Class[];
  onTabChange: (tab: string) => void;
  onClassClick: (classId: string) => void;
  onSignOut: () => void;
}

const CheckInTabs: React.FC<CheckInTabsProps> = ({
  activeTab,
  loading,
  classes,
  onTabChange,
  onClassClick,
  onSignOut,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsContent value="inicio">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <DashboardTab 
            classes={classes}
            onTabChange={onTabChange}
            onClassClick={onClassClick}
          />
        )}
      </TabsContent>
      <TabsContent value="aulas">
        <ClassesTab onClassClick={onClassClick} />
      </TabsContent>
      <TabsContent value="treinos">
        <TrainingTab />
      </TabsContent>
      <TabsContent value="perfil">
        <ProfileTab onSignOut={onSignOut} />
      </TabsContent>
    </Tabs>
  );
};

export default CheckInTabs;
