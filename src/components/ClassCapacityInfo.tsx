
import React from "react";
import { ClassDetail } from "@/types";
import CapacityBar from "@/components/CapacityBar";
import { Users } from "lucide-react";

interface ClassCapacityInfoProps {
  classData: ClassDetail;
  className?: string;
}

const ClassCapacityInfo: React.FC<ClassCapacityInfoProps> = ({
  classData,
  className = "",
}) => {
  const attendeeText = `${classData.attendeeCount}/${classData.maxCapacity}`;
  const isFull = classData.attendeeCount >= classData.maxCapacity;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-gray-600">Capacidade</h3>
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-500 mr-1" />
          <span className={`${isFull ? "text-red-600 font-medium" : "text-gray-700"}`}>
            {attendeeText}
          </span>
          {isFull && (
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              Lotado
            </span>
          )}
        </div>
      </div>
      <CapacityBar
        current={classData.attendeeCount}
        total={classData.maxCapacity}
      />
    </div>
  );
};

export default ClassCapacityInfo;
