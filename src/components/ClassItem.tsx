
import React from "react";
import { format, isValid } from "date-fns";
import { Class } from "../types";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import { CheckCircle } from "lucide-react";

interface ClassItemProps {
  classData: Class;
  onClick: () => void;
}

const ClassItem: React.FC<ClassItemProps> = ({ classData, onClick }) => {
  const {
    startTime,
    endTime,
    programName,
    coachName,
    coachAvatar,
    attendeeCount,
    maxCapacity,
    isCheckedIn,
  } = classData;

  // Garantir que as datas são objetos Date válidos antes de formatar
  const startTimeFormatted = startTime instanceof Date && isValid(startTime) 
    ? format(startTime, "HH:mm") 
    : "00:00";
    
  const endTimeFormatted = endTime instanceof Date && isValid(endTime)
    ? format(endTime, "HH:mm") 
    : "00:00";
    
  const isFull = attendeeCount >= maxCapacity;

  return (
    <div
      className={cn(
        "class-item p-4 border rounded-lg shadow-sm mb-4 flex justify-between items-start cursor-pointer hover:shadow-md transition-shadow",
        isFull ? "bg-red-50" : "bg-white",
        isCheckedIn ? "border-blue-500 bg-blue-50" : ""
      )}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between">
        <div>
          <div className="font-semibold text-lg">
            {startTimeFormatted} - {endTimeFormatted}
          </div>
          <div className="text-sm text-gray-600">{programName}</div>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <Avatar url={coachAvatar} name={coachName} size={24} />
          <span className="text-sm">{coachName}</span>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        {isCheckedIn && (
          <div className="check-in-indicator text-blue-500">
            <CheckCircle size={20} className="fill-blue-500 text-white" />
          </div>
        )}
        
        <div className="text-sm mt-auto">
          <span className={`${isFull ? "text-red-500" : "text-gray-600"}`}>
            {isFull ? "Lotado" : `${attendeeCount}/${maxCapacity} vagas`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClassItem;
