
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";

interface UsersHeaderProps {
  onRefresh: () => void;
  onNewUser: () => void;
  isRefreshing: boolean;
}

const UsersHeader = ({ onRefresh, onNewUser, isRefreshing }: UsersHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Usuários</h2>
        <p className="text-gray-500">Gerenciar alunos, professores e administradores</p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-700" 
          onClick={onNewUser}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>
    </div>
  );
};

export default UsersHeader;
