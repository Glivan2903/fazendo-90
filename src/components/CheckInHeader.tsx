
import React from "react";
import { useLocation } from "react-router-dom";

const CheckInHeader: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('profile')) return "Meu Perfil";
    if (path.includes('check-in')) return "Check-in";
    if (path.includes('aulas')) return "Aulas";
    if (path.includes('treinos')) return "Treinos";
    return "Check-in";
  };

  return (
    <header className="flex items-center p-4 border-b bg-white rounded-t-lg shadow-sm mb-4">
      <h1 className="text-xl font-bold">{getPageTitle()}</h1>
    </header>
  );
};

export default CheckInHeader;
