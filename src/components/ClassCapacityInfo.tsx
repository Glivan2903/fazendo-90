
import React from "react";
import { Users } from "lucide-react";
import CapacityBar from "./CapacityBar";
import { ClassDetail } from "../types";

interface ClassCapacityInfoProps {
  classData: ClassDetail;
  className?: string;
}

const ClassCapacityInfo: React.FC<ClassCapacityInfoProps> = ({ classData, className }) => {
  // Determinar a cor baseada na capacidade
  const getCapacityColor = () => {
    const percentage = (classData.attendeeCount / classData.maxCapacity) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-gray-700";
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500">Capacidade</h2>
        <div className="flex items-center">
          <Users size={16} className={`mr-1 ${getCapacityColor()}`} />
          <span className={`text-sm ${getCapacityColor()}`}>
            {classData.attendeeCount}/{classData.maxCapacity}
          </span>
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
