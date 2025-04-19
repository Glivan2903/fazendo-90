
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserProfileHeaderProps {
  profile: {
    name: string;
    status: string;
    avatar_url: string | null;
    created_at: string;
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
  const memberSince = profile.created_at ? 
    new Date(profile.created_at).toLocaleDateString('pt-BR') : 
    "N/A";

  const initials = profile.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="p-6">
      <CardContent className="pt-6">
        <div className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
          <Badge 
            className={`mb-4 ${
              profile.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {profile.status}
          </Badge>

          <div className="text-sm text-gray-500 mb-6">
            Membro desde {memberSince}
          </div>

          <Button
            variant={isEditing ? 'destructive' : 'default'}
            onClick={() => setIsEditing(!isEditing)}
            className="w-full"
          >
            {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{checkinsCount}</div>
              <div className="text-sm text-gray-600">Total de check-ins</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{memberSince}</div>
              <div className="text-sm text-gray-600">Membro desde</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileHeader;
