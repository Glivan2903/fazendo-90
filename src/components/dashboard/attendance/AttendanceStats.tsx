
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarClock, TrendingUp, Users } from 'lucide-react';

interface AttendanceStatsProps {
  todayCheckins: number;
  totalCheckins: number;
  activeUsers: number;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ todayCheckins, totalCheckins, activeUsers }) => {
  const stats = [
    {
      title: "Check-ins Hoje",
      value: todayCheckins,
      icon: CalendarClock,
      color: "text-blue-600"
    },
    {
      title: "Total de Check-ins",
      value: totalCheckins,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Usuários Ativos",
      value: activeUsers,
      icon: Users,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceStats;
