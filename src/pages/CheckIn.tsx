
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import CheckInHeader from "../components/CheckInHeader";
import BottomNavigation from "../components/BottomNavigation";
import DashboardTab from "../components/tabs/DashboardTab";
import ClassesTab from "../components/tabs/ClassesTab";
import TrainingTab from "../components/tabs/TrainingTab";
import ProfileTab from "../components/tabs/ProfileTab";

const CheckIn = () => {
  const [activeTab, setActiveTab] = useState("aulas");
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleClassClick = (classId: string) => {
    navigate(`/class/${classId}`);
  };
  
  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <CheckInHeader 
        onTabChange={handleTabChange}
        onSignOut={signOut}
      />
      
      {/* Tab content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsContent value="inicio">
          <DashboardTab 
            classes={[]} // This will be populated in ClassesTab and passed here
            onTabChange={handleTabChange}
            onClassClick={handleClassClick}
          />
        </TabsContent>
        <TabsContent value="aulas">
          <ClassesTab onClassClick={handleClassClick} />
        </TabsContent>
        <TabsContent value="treinos">
          <TrainingTab />
        </TabsContent>
        <TabsContent value="perfil">
          <ProfileTab onSignOut={signOut} />
        </TabsContent>
      </Tabs>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default CheckIn;
