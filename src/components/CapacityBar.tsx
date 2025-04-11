
import React from "react";

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

  return (
    <div className={`capacity-bar ${className}`}>
      <div className="capacity-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default CapacityBar;
