
import React from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Class } from "@/types";
import ClassCard from "./ClassCard";

interface GridViewProps {
  classes: Class[];
  dateRange: { start: Date; end: Date };
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
  onEditClass: (classData: any) => void;
  onNewClass: (date: Date, hour: string) => void;
}

const GridView: React.FC<GridViewProps> = ({
  classes,
  dateRange,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  onEditClass,
  onNewClass
}) => {
  const hours = ["05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00"];

  const getClassDataForDayAndHour = (day: number, hour: string) => {
    return classes.filter(cls => {
      try {
        if (!cls.startTime || !isValid(new Date(cls.startTime))) {
          return false;
        }
        
        const classDate = new Date(cls.startTime);
        const classHour = format(classDate, "HH:mm");
        const dayOfWeek = classDate.getDay();
        
        return dayOfWeek === day && classHour === hour;
      } catch (error) {
        console.error("Error filtering class", error);
        return false;
      }
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center space-x-2 w-full sm:w-auto mb-2 sm:mb-0">
          <Button variant="outline" size="icon" onClick={onPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm sm:text-base">
            <span className="font-medium">
              {format(dateRange.start, "dd MMM.", { locale: ptBR })} - {format(dateRange.end, "dd MMM.", { locale: ptBR })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={onNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onResetWeek}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-right">
          Total de {classes.length} classes
        </div>
      </div>
    
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <Table className="border rounded">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[80px]">Horário</TableHead>
                {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                  const date = addDays(dateRange.start, dayOffset);
                  return (
                    <TableHead key={dayOffset} className="text-center">
                      <div className="text-blue-600 font-bold">
                        {format(date, "dd/MM", { locale: ptBR })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(date, "EEEE", { locale: ptBR }).toUpperCase()}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hours.map((hour) => (
                <TableRow key={hour}>
                  <TableCell className="font-medium text-gray-700">{hour}</TableCell>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const classesForCell = getClassDataForDayAndHour(day, hour);
                    return (
                      <TableCell key={day} className="p-1">
                        {classesForCell.length > 0 ? (
                          classesForCell.map((cls, idx) => (
                            <div key={idx} className="mb-1">
                              <ClassCard classData={cls} onClick={() => onEditClass(cls)} />
                            </div>
                          ))
                        ) : (
                          <div 
                            className="h-16 border border-dashed border-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              const dayDate = addDays(dateRange.start, day);
                              onNewClass(dayDate, hour);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            <span>Adicionar aula</span>
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
    </>
  );
};

export default GridView;
