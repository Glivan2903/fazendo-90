
import React from "react";
import Avatar from "./Avatar";
import { ClassDetail } from "../types";

interface ClassCoachInfoProps {
  classData: ClassDetail;
}

const ClassCoachInfo: React.FC<ClassCoachInfoProps> = ({ classData }) => {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-medium text-gray-500 mb-2">Professor</h2>
      <div className="flex items-center gap-3">
        <Avatar
          url={classData.coach.avatarUrl}
          name={classData.coach.name}
          size={40}
        />
        <span className="font-medium">{classData.coach.name}</span>
      </div>
    </div>
  );
};

export default ClassCoachInfo;
