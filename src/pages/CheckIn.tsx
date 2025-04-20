
import React from "react";
import { Navigate } from "react-router-dom";
import CheckInHeader from "../components/CheckInHeader";
import CheckInTabs from "../components/check-in/CheckInTabs";
import { useCheckInPage } from "@/hooks/useCheckInPage";
import { SidebarProvider } from "@/components/ui/sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";

const CheckIn = () => {
  const {
    activeTab,
    classes,
    loading,
    user,
    signOut,
    handleTabChange,
    handleClassClick,
  } = useCheckInPage();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <MobileMenu 
          menuOpen={true} 
          setMenuOpen={() => {}}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          signOut={signOut}
        />
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-md mx-auto px-4 pb-16">
            <CheckInHeader />
            
            <CheckInTabs
              activeTab={activeTab}
              loading={loading}
              classes={classes}
              onTabChange={handleTabChange}
              onClassClick={handleClassClick}
              onSignOut={signOut}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CheckIn;
