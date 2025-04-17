
import React from "react";

interface UserStatusBadgeProps {
  status?: string;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status = "Ativo" }) => {
  const normalizedStatus = status?.toLowerCase() || "ativo";
  
  const badgeClass = `px-2 py-1 rounded-full text-xs font-medium ${
    normalizedStatus === "ativo" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800"
  }`;

  return <span className={badgeClass}>{status || "Ativo"}</span>;
};

export default UserStatusBadge;
