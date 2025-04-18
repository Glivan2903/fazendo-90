
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfileHeaderProps {
  profile: {
    name: string;
    avatar_url: string | null;
    created_at: string;
    status: string;
  };
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  checkinsCount: number;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  profile,
  isEditing,
  setIsEditing,
  checkinsCount,
}) => {
  const memberSince = format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR });
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="text-center">
      <Avatar className="w-32 h-32 mx-auto mb-4">
        <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>

      <Badge variant={profile.status === 'Ativo' ? 'default' : 'secondary'} className="mb-4">
        {profile.status}
      </Badge>

      <div className="text-sm text-gray-500 mb-4">
        Membro desde {memberSince}
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Total de Check-ins: {checkinsCount}
      </div>

      <Button
        variant={isEditing ? 'destructive' : 'default'}
        onClick={() => setIsEditing(!isEditing)}
        className="w-full"
      >
        {isEditing ? (
          <>
            <X className="w-4 h-4 mr-2" />
            Cancelar Edição
          </>
        ) : (
          <>
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Perfil
          </>
        )}
      </Button>
    </div>
  );
};

export default UserProfileHeader;
