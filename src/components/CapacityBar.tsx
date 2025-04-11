
import React from "react";
import { cn } from "@/lib/utils";

interface CapacityBarProps {
  current: number;
  total: number;
  className?: string;
}

const CapacityBar: React.FC<CapacityBarProps> = ({
  current,
  total,
  className = "",
}) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  
  let fillColorClass = "bg-blue-500";
  if (percentage > 85) {
    fillColorClass = "bg-red-500";
  } else if (percentage > 60) {
    fillColorClass = "bg-orange-400";
  } else if (percentage > 30) {
    fillColorClass = "bg-green-500";
  }

  return (
    <div className={cn("h-2 w-full bg-gray-200 rounded-full overflow-hidden", className)}>
      <div 
        className={cn("h-full transition-all duration-300", fillColorClass)} 
        style={{ width: `${percentage}%` }} 
      />
    </div>
  );
};

export default CapacityBar;
