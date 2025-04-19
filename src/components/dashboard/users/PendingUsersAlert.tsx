
import React from 'react';
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingUsersAlertProps {
  pendingUsersCount: number;
  onViewPending: () => void;
}

const PendingUsersAlert = ({ pendingUsersCount, onViewPending }: PendingUsersAlertProps) => {
  if (pendingUsersCount === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <UserCheck className="h-5 w-5 text-amber-600 mr-2" />
        <span className="text-amber-800">
          {pendingUsersCount} {pendingUsersCount === 1 ? 'usuário pendente' : 'usuários pendentes'} de aprovação
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="border-amber-300 hover:bg-amber-100 text-amber-800"
        onClick={onViewPending}
      >
        Ver pendentes
      </Button>
    </div>
  );
};

export default PendingUsersAlert;
