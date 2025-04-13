
import React from "react";
import { format } from "date-fns";
import { CheckCircle, User } from "lucide-react";
import { Class } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ClassItemProps = {
  classData: Class;
  onClick: () => void;
};

const ClassItem: React.FC<ClassItemProps> = ({ classData, onClick }) => {
  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
  };
  
  const timeSlot = `${formatTime(classData.startTime)} - ${formatTime(classData.endTime)}`;
  const isFull = classData.attendeeCount >= classData.maxCapacity;
  const isCheckedIn = classData.isCheckedIn;
  
  const getCoachInitials = () => {
    if (!classData.coachName) return "C";
    
    const nameParts = classData.coachName.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0);
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
  };
  
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all",
        isCheckedIn ? "bg-blue-50 border-blue-200" : "bg-white hover:shadow-md",
        isFull && !isCheckedIn ? "bg-gray-50 border-gray-200" : ""
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">{timeSlot}</div>
          <div className="text-gray-700">{classData.programName}</div>
          
          <div className="flex items-center mt-1">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={classData.coachAvatar} />
              <AvatarFallback>{getCoachInitials()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{classData.coachName}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={cn(
            "text-sm font-medium",
            isFull ? "text-red-500" : "text-gray-500"
          )}>
            {classData.attendeeCount}/{classData.maxCapacity} vagas
          </div>
          
          {isCheckedIn && (
            <div className="flex items-center justify-end text-green-600 mt-2">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm">Check-in feito</span>
            </div>
          )}
          
          {isFull && !isCheckedIn && (
            <div className="text-red-500 text-sm font-medium mt-2">
              Lotado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassItem;
