
import React from 'react';
import { User } from "@/types";

interface UserStatsProps {
  users: User[];
  pendingUsersCount: number;
}

const UserStats = ({ users, pendingUsersCount }: UserStatsProps) => {
  const activeUsersCount = users.filter(user => user.status === "Ativo").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border rounded-lg p-4 bg-white">
        <div className="text-sm font-medium text-gray-500">Total de Usuários</div>
        <div className="text-2xl font-bold mt-1">{users.length}</div>
      </div>
      <div className="border rounded-lg p-4 bg-white">
        <div className="text-sm font-medium text-gray-500">Usuários Ativos</div>
        <div className="text-2xl font-bold mt-1 text-green-600">{activeUsersCount}</div>
      </div>
      <div className="border rounded-lg p-4 bg-white">
        <div className="text-sm font-medium text-gray-500">Usuários Pendentes</div>
        <div className="text-2xl font-bold mt-1 text-amber-600">{pendingUsersCount}</div>
      </div>
    </div>
  );
};

export default UserStats;
