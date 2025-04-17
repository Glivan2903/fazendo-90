
import React from "react";

interface UserRoleBadgeProps {
  role?: string;
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role = "student" }) => {
  const normalizedRole = role?.toLowerCase() || "student";
  const isAdmin = normalizedRole === "admin" || normalizedRole === "administrador";
  const isCoach = normalizedRole === "coach" || normalizedRole === "professor";

  const badgeClass = `px-2 py-1 rounded-full text-xs font-medium ${
    isAdmin
      ? "bg-purple-100 text-purple-800" 
      : isCoach
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800"
  }`;

  const displayRole = isAdmin 
    ? "Administrador" 
    : isCoach 
      ? "Professor" 
      : "Aluno";

  return <span className={badgeClass}>{displayRole}</span>;
};

export default UserRoleBadge;
