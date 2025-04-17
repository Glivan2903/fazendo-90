
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, X } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  memberSince: string;
  avatarUrl?: string;
  initials: string;
  isEditing: boolean;
  isOwnProfile: boolean;
  onBackClick: () => void;
  onEditToggle: () => void;
}

const ProfileHeader = ({
  name,
  memberSince,
  avatarUrl,
  initials,
  isEditing,
  isOwnProfile,
  onBackClick,
  onEditToggle,
}: ProfileHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBackClick}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        {isOwnProfile && (
          <Button 
            variant={isEditing ? "outline" : "ghost"} 
            size="sm" 
            onClick={onEditToggle}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-1" />
                Editar Perfil
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={avatarUrl || "https://api.dicebear.com/6.x/avataaars/svg"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-gray-500">Membro desde {memberSince}</p>
      </div>
    </>
  );
};

export default ProfileHeader;
