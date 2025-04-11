
import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  url?: string;
  name: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, size = 40, className }) => {
  const initials = name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-blue-500 text-white overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=1677ff&color=fff`;
          }}
        />
      ) : (
        <span className="text-sm font-medium">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
