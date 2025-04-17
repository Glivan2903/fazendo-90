
import React from "react";
import { AlertCircle } from "lucide-react";
import { Class } from "@/types";

interface ClassCardProps {
  classData: Class;
  onClick: (classData: Class) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick }) => {
  return (
    <div 
      className="p-2 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
      onClick={() => onClick(classData)}
    >
      <div className="font-medium text-blue-800">{classData.programName}</div>
      <div className="text-sm">{classData.coachName}</div>
      <div className="text-xs flex items-center">
        <span className={classData.attendeeCount >= classData.maxCapacity ? "text-red-600" : "text-green-600"}>
          {classData.attendeeCount}/{classData.maxCapacity}
        </span>
        {classData.attendeeCount >= classData.maxCapacity && (
          <AlertCircle className="h-3 w-3 ml-1 text-red-600" />
        )}
      </div>
    </div>
  );
};

export default ClassCard;
