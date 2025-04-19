
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface AvatarProps {
  url?: string;
  name: string;
  size?: number;
  className?: string;
  userId?: string;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, size = 40, className, userId }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(url);
  
  useEffect(() => {
    if (url) {
      setAvatarUrl(url);
    } else if (userId) {
      // Buscar o avatar do usuário se não tiver URL mas tiver userId
      const fetchAvatarUrl = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();
            
          if (error) {
            console.error('Erro ao buscar avatar:', error);
            return;
          }
          
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        } catch (error) {
          console.error('Erro ao buscar avatar:', error);
        }
      };
      
      fetchAvatarUrl();
    }
  }, [url, userId]);

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
      {avatarUrl ? (
        <img
          src={avatarUrl}
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
