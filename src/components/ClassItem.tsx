
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

  // Check if startTime and endTime are valid Date objects before formatting
  const startTimeFormatted = isValid(startTime) 
    ? format(startTime, "HH:mm") 
    : "00:00";
    
  const endTimeFormatted = isValid(endTime) 
    ? format(endTime, "HH:mm") 
    : "00:00";
    
  const isFull = attendeeCount >= maxCapacity;

  return (
    <div
      className={cn(
        "class-item",
        isFull ? "full" : "",
        isCheckedIn ? "checked-in" : ""
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
