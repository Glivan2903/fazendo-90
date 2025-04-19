
import React from "react";

interface CheckInHeaderProps {
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const CheckInHeader: React.FC<CheckInHeaderProps> = ({ onTabChange, onSignOut }) => {
  return (
    <header className="py-6 flex justify-between items-center">
      <div className="flex-1"></div>
      <div className="text-center flex-1"></div>
    </header>
  );
};

export default CheckInHeader;
