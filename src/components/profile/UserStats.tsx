
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatBlockProps {
  value: number | string;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="bg-blue-50 p-4 rounded-lg text-center">
    <div className="text-blue-600 text-2xl font-bold">{value}</div>
    <div className="text-gray-600 text-sm">{label}</div>
  </div>
);

interface UserStatsProps {
  stats: {
    checkinsThisMonth: number;
    attendanceRate: number;
    workoutsPerWeek: number;
    totalCheckins: number;
  };
}

const UserStats = ({ stats }: UserStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <StatBlock value={stats.checkinsThisMonth} label="Check-ins este mês" />
        <StatBlock value={`${stats.attendanceRate}%`} label="Taxa de Frequência" />
        <StatBlock value={stats.workoutsPerWeek} label="Treinos por semana" />
        <StatBlock value={stats.totalCheckins} label="Total de check-ins" />
      </CardContent>
    </Card>
  );
};

export default UserStats;
