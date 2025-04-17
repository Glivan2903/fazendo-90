
import React from "react";
import { format } from "date-fns";
import { CheckCircle, User, MapPin } from "lucide-react";
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
  const isFull = classData.attendeeCount >= (classData.maxCapacity || classData.max_capacity);
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
        <div className="flex-1">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
            <div className="text-lg font-bold">{timeSlot}</div>
          </div>
          
          <div className="text-gray-700 font-medium mt-1">{classData.programName}</div>
          
          <div className="flex items-center mt-2 text-gray-600">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage src={classData.coachAvatar} />
              <AvatarFallback className="text-xs">{getCoachInitials()}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{classData.coachName}</span>
          </div>
          
          <div className="flex items-center mt-1 text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-xs">Cross Box Fênix</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={cn(
            "text-sm font-medium",
            isFull ? "text-red-500" : "text-gray-500"
          )}>
            {classData.attendeeCount}/{classData.maxCapacity || classData.max_capacity}
          </div>
          
          {isCheckedIn && (
            <div className="flex items-center justify-end text-green-600 mt-2">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
          
          {isFull && !isCheckedIn && (
            <div className="mt-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full whitespace-nowrap">
              Lotado
            </div>
          )}
          
          {!isFull && !isCheckedIn && (
            <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full whitespace-nowrap">
              Check-in
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassItem;
