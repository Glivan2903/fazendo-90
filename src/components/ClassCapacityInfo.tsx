
import React from "react";
import { Users } from "lucide-react";
import CapacityBar from "./CapacityBar";
import { ClassDetail } from "../types";

interface ClassCapacityInfoProps {
  classData: ClassDetail;
}

const ClassCapacityInfo: React.FC<ClassCapacityInfoProps> = ({ classData }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500">Capacidade</h2>
        <div className="flex items-center">
          <Users size={16} className="mr-1 text-gray-500" />
          <span className="text-sm text-gray-700">
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
