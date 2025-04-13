
import React from "react";
import { Class } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from "lucide-react";

interface ScheduleTabProps {
  classes: Class[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ classes }) => {
  const isMobile = useIsMobile();
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const hours = ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00"];
  
  const getClassDataForDayAndHour = (day: number, hour: string) => {
    return classes.filter(cls => {
      const classDate = new Date(cls.startTime);
      const classHour = format(classDate, "HH:mm");
      const dayOfWeek = (classDate.getDay() + 6) % 7;
      return dayOfWeek === day && classHour === hour;
    });
  };
  
  const renderMobileView = () => {
    return (
      <div className="space-y-4">
        {days.map((day, dayIndex) => (
          <Card key={dayIndex} className="mb-4">
            <CardHeader className="py-2">
              <CardTitle className="text-base">{day}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {hours.map((hour) => {
                  const classesForCell = getClassDataForDayAndHour(dayIndex, hour);
                  if (classesForCell.length === 0) return null;
                  
                  return (
                    <div key={hour} className="p-3">
                      <h3 className="text-sm font-medium text-gray-500">{hour}</h3>
                      {classesForCell.map((cls, idx) => (
                        <div key={idx} className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="font-medium text-blue-800">{cls.programName}</div>
                          <div className="text-sm">{cls.coachName}</div>
                          <div className="text-xs flex items-center">
                            <span className={cls.attendeeCount >= cls.maxCapacity ? "text-red-600" : "text-green-600"}>
                              {cls.attendeeCount}/{cls.maxCapacity}
                            </span>
                            {cls.attendeeCount >= cls.maxCapacity && (
                              <AlertCircle className="h-3 w-3 ml-1 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderDesktopView = () => {
    return (
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Horário</TableHead>
                {days.map((day, index) => (
                  <TableHead key={index}>{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hours.map((hour) => (
                <TableRow key={hour}>
                  <TableCell className="font-medium">{hour}</TableCell>
                  {days.map((_, dayIndex) => {
                    const classesForCell = getClassDataForDayAndHour(dayIndex, hour);
                    return (
                      <TableCell key={dayIndex}>
                        {classesForCell.length > 0 && (
                          <div className="p-2 bg-blue-50 rounded border border-blue-200">
                            {classesForCell.map((cls, idx) => (
                              <div key={idx} className="mb-2 last:mb-0">
                                <div className="font-medium text-blue-800">{cls.programName}</div>
                                <div className="text-sm">{cls.coachName}</div>
                                <div className="text-xs flex items-center">
                                  <span className={cls.attendeeCount >= cls.maxCapacity ? "text-red-600" : "text-green-600"}>
                                    {cls.attendeeCount}/{cls.maxCapacity}
                                  </span>
                                  {cls.attendeeCount >= cls.maxCapacity && (
                                    <AlertCircle className="h-3 w-3 ml-1 text-red-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Horária Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
