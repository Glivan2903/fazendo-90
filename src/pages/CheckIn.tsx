
import React from "react";
import { Navigate } from "react-router-dom";
import CheckInHeader from "../components/CheckInHeader";
import CheckInTabs from "../components/check-in/CheckInTabs";
import BottomNavigation from "../components/BottomNavigation";
import { useCheckInPage } from "@/hooks/useCheckInPage";

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
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default CheckIn;
