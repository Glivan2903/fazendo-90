
import React from "react";
import { Class } from "@/types";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Users, Calendar, BarChart, Clock, Loader2 } from "lucide-react";

interface OverviewTabProps {
  classes: Class[];
  loading: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ classes, loading }) => {
  const totalStudents = 128;
  const classesCount = classes.length;
  const completedClasses = classes.filter(c => 
    new Date(c.startTime) < new Date()
  ).length;
  
  const attendanceRate = classes.length > 0 
    ? Math.round((classes.reduce((sum, c) => sum + c.attendeeCount, 0) / 
        (classes.reduce((sum, c) => sum + c.maxCapacity, 0)) * 100))
    : 0;
    
  const nextClass = classes.find(c => new Date(c.startTime) > new Date());
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Aulas Esta Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classesCount}</div>
          <p className="text-xs text-muted-foreground">{Math.round(classesCount/7)} aulas por dia em média</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendanceRate}%</div>
          <p className="text-xs text-muted-foreground">Baseado nas aulas de hoje</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Próxima Aula</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {nextClass ? (
            <>
              <div className="text-2xl font-bold">
                {format(new Date(nextClass.startTime), "HH:mm")}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextClass.programName} - {nextClass.attendeeCount} alunos
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">--:--</div>
              <p className="text-xs text-muted-foreground">
                Nenhuma aula programada
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Aulas de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : classes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => {
                  const startTime = new Date(cls.startTime);
                  const endTime = new Date(cls.endTime);
                  const now = new Date();
                  let status = "Agendada";
                  let statusClass = "bg-gray-100 text-gray-800";
                  
                  if (now > endTime) {
                    status = "Concluída";
                    statusClass = "bg-green-100 text-green-800";
                  } else if (now >= startTime) {
                    status = "Em progresso";
                    statusClass = "bg-yellow-100 text-yellow-800";
                  } else if (startTime.getTime() - now.getTime() < 3600000) {
                    status = "Em breve";
                    statusClass = "bg-yellow-100 text-yellow-800";
                  }
                  
                  return (
                    <TableRow key={cls.id}>
                      <TableCell>
                        {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                      </TableCell>
                      <TableCell>{cls.programName}</TableCell>
                      <TableCell>{cls.coachName}</TableCell>
                      <TableCell>{cls.attendeeCount}/{cls.maxCapacity}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full ${statusClass}`}>
                          {status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma aula agendada para hoje
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
