
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AvatarUpload from '@/components/profile/AvatarUpload';
import UserStats from '@/components/profile/UserStats';
import UserInfo from '@/components/profile/UserInfo';

interface ProfileTabProps {
  onSignOut: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url);

  const memberSince = format(
    new Date(user?.created_at || new Date()),
    "MMMM 'de' yyyy",
    { locale: ptBR }
  );

  const userInitials = (user?.user_metadata?.name || 'User')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <AvatarUpload
          avatarUrl={avatarUrl}
          userId={user?.id || ''}
          userInitials={userInitials}
          onAvatarUpdate={setAvatarUrl}
        />
        <div className="text-center">
          <h2 className="text-xl font-bold">{user?.user_metadata?.name || 'Usuário'}</h2>
          <p className="text-sm text-gray-500">Membro desde {memberSince}</p>
        </div>
      </div>

      <UserInfo user={user} />
      <UserStats userId={user?.id} />

      <Button
        variant="outline"
        className="w-full"
        onClick={onSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair
      </Button>
    </div>
  );
};

export default ProfileTab;
