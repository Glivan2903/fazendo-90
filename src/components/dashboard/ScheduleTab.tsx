
import React from "react";
import { Class } from "@/types";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface ScheduleTabProps {
  classes: Class[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ classes }) => {
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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Horária Semanal</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
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
                                  <div className="text-xs text-gray-500">{cls.attendeeCount}/{cls.maxCapacity}</div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
