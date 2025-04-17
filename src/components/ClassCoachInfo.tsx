
import React from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { ClassDetail } from "../types";

interface ClassCoachInfoProps {
  classData: ClassDetail;
  className?: string;
}

const ClassCoachInfo: React.FC<ClassCoachInfoProps> = ({ classData, className }) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <h2 className="text-sm font-medium text-gray-500 mb-2">Professor</h2>
      <Link to={`/profile/${classData.coach.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
        <Avatar
          url={classData.coach.avatarUrl}
          name={classData.coach.name}
          size={40}
        />
        <span className="font-medium">{classData.coach.name}</span>
      </Link>
    </div>
  );
};

export default ClassCoachInfo;
