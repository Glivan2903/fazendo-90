
import React from 'react';
import { Card } from '@/components/ui/card';

export interface UserStatsProps {
  stats: {
    checkinsThisMonth: number;
    attendanceRate: number;
    workoutsPerWeek: number;
    totalCheckins: number;
  };
  isLoading?: boolean;
}

const UserStats: React.FC<UserStatsProps> = ({ stats, isLoading = false }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {isLoading ? "..." : stats.totalCheckins}
          </div>
          <div className="text-sm text-gray-500">Total de check-ins</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {isLoading ? "..." : stats.checkinsThisMonth}
          </div>
          <div className="text-sm text-gray-500">Check-ins este mês</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {isLoading ? "..." : stats.workoutsPerWeek}
          </div>
          <div className="text-sm text-gray-500">Treinos por semana</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {isLoading ? "..." : stats.attendanceRate}%
          </div>
          <div className="text-sm text-gray-500">Taxa de presença</div>
        </div>
      </Card>
    </div>
  );
};

export default UserStats;
