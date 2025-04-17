
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import CheckInHeader from "../components/CheckInHeader";
import BottomNavigation from "../components/BottomNavigation";
import DashboardTab from "../components/tabs/DashboardTab";
import ClassesTab from "../components/tabs/ClassesTab";
import TrainingTab from "../components/tabs/TrainingTab";
import ProfileTab from "../components/tabs/ProfileTab";
import { fetchClasses } from "@/api/classApi";
import { Class } from "@/types";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";

const CheckIn = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  
  useEffect(() => {
    const loadTodayClasses = async () => {
      setLoading(true);
      try {
        console.log("Loading today's classes for dashboard");
        const today = new Date();
        const fetchedClasses = await fetchClasses(today);
        console.log("Fetched classes:", fetchedClasses);
        setClasses(fetchedClasses);
      } catch (error) {
        console.error("Error fetching today's classes:", error);
        toast.error("Erro ao carregar aulas de hoje");
      } finally {
        setLoading(false);
      }
    };
    
    loadTodayClasses();
  }, []);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleClassClick = (classId: string) => {
    navigate(`/class/${classId}`);
  };
  
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <CheckInHeader 
        onTabChange={handleTabChange}
        onSignOut={signOut}
      />
      
      {/* Tab content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsContent value="inicio">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <DashboardTab 
              classes={classes}
              onTabChange={handleTabChange}
              onClassClick={handleClassClick}
            />
          )}
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
