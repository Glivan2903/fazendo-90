
import React from "react";
import { Calendar, BarChart2, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Class } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardTabProps {
  classes: Class[];
  onTabChange: (tab: string) => void;
  onClassClick: (classId: string) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  classes,
  onTabChange,
  onClassClick
}) => {
  // Get the next scheduled class (if any)
  const now = new Date();
  const upcomingClass = classes.find(cls => new Date(cls.startTime) > now);

  // Format date in Portuguese
  const formatDate = (date: Date) => {
    try {
      return format(date, "HH:mm", { locale: ptBR });
    } catch (error) {
      console.error("Invalid date format:", date, error);
      return "--:--";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo à Cross Box Fênix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Próxima aula</h3>
              <Button variant="link" size="sm" className="text-blue-600 p-0" onClick={() => onTabChange("aulas")}>
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {upcomingClass ? (
              <div className="mt-2 flex items-center border-l-4 border-blue-600 pl-3">
                <div className="flex-1">
                  <h4 className="font-bold">{upcomingClass.programName}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(new Date(upcomingClass.startTime))} - {formatDate(new Date(upcomingClass.endTime))}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    {upcomingClass.coachName}
                  </div>
                </div>
                <Button onClick={() => onClassClick(upcomingClass.id)}>Check-in</Button>
              </div>
            ) : (
              <div className="mt-2 py-4 text-center text-gray-500">
                Não há aulas agendadas para hoje.
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onTabChange("aulas")}>
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-bold">Aulas</h3>
              <p className="text-sm text-gray-500">Veja e faça check-in</p>
            </div>
            <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onTabChange("treinos")}>
              <BarChart2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-bold">Treinos</h3>
              <p className="text-sm text-gray-500">Acompanhe seu progresso</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho Recente</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <p>Você ainda não tem dados de desempenho.</p>
          <p>Comece a fazer check-in nas aulas!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
