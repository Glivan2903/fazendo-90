
import React from "react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Edit } from "lucide-react";
import { Class } from "@/types";

interface ListViewProps {
  classes: Class[];
  selectedDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onEditClass: (classData: any) => void;
}

const ListView: React.FC<ListViewProps> = ({
  classes,
  selectedDate,
  onPrevDay,
  onNextDay,
  onToday,
  onEditClass
}) => {
  const classesByDay = classes.reduce((acc: { [key: string]: Class[] }, cls) => {
    try {
      if (!cls.startTime || !isValid(new Date(cls.startTime))) {
        return acc;
      }
      
      const dateStr = format(new Date(cls.startTime), 'yyyy-MM-dd');
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      
      acc[dateStr].push(cls);
      return acc;
    } catch (error) {
      console.error("Error grouping class by day:", error);
      return acc;
    }
  }, {});
  
  const sortedDates = Object.keys(classesByDay).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center space-x-2 w-full sm:w-auto mb-2 sm:mb-0">
          <Button variant="outline" size="icon" onClick={onPrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm sm:text-base">
            <span className="font-medium">
              {format(selectedDate, "d MMM yyyy", { locale: ptBR })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={onNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onToday}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-right">
          Total de {classes.length} classes
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.map(dateStr => {
          const date = new Date(dateStr);
          const dayClasses = classesByDay[dateStr];
          
          return (
            <div key={dateStr} className="space-y-2">
              <div className="text-center">
                <h3 className="text-lg font-bold text-blue-600">
                  {format(date, "dd/MM", { locale: ptBR })}
                </h3>
                <p className="text-xs text-gray-500 uppercase">
                  {format(date, "EEEE", { locale: ptBR })}
                </p>
              </div>
              
              <div className="space-y-2">
                {dayClasses.map((cls, index) => {
                  const startTime = new Date(cls.startTime);
                  const endTime = new Date(cls.endTime);
                  
                  return (
                    <div 
                      key={index} 
                      className="border rounded-lg p-3 shadow-sm hover:shadow transition-all cursor-pointer"
                      onClick={() => onEditClass(cls)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-red-500 font-semibold">
                            {format(startTime, "HH:mm", { locale: ptBR })} - {format(endTime, "HH:mm", { locale: ptBR })}
                          </div>
                          <div className="font-bold uppercase">{cls.programName}</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm text-gray-600">{cls.coachName}</div>
                        <div className="text-sm font-medium">
                          {cls.attendeeCount}/{cls.maxCapacity} vagas
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {sortedDates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma aula encontrada para esta data.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
