
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AvatarUpload from '@/components/profile/AvatarUpload';
import UserStats from '@/components/profile/UserStats';
import UserInfo from '@/components/profile/UserInfo';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileTabProps {
  onSignOut: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url);
  const { subscription, isLoading: loadingSubscription } = useSubscriptionStatus(user?.id);

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

  const stats = {
    checkinsThisMonth: 0,
    attendanceRate: 0,
    workoutsPerWeek: 0,
    totalCheckins: 0
  };

  // Create user info object with proper typing
  const userInfoData = {
    name: user?.user_metadata?.name,
    email: user?.email,
    phone: user?.user_metadata?.phone || null,
    birth_date: user?.user_metadata?.birth_date || null
  };

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

      {subscription?.isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sua assinatura está vencida. Por favor, entre em contato com a administração para renovar.
          </AlertDescription>
        </Alert>
      )}

      {subscription && !loadingSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações da Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Plano:</span>
                <span className="font-medium">{subscription.plans?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge className={
                  subscription.isExpired ? "bg-red-100 text-red-800" : 
                  subscription.status === 'active' ? "bg-green-100 text-green-800" : 
                  "bg-amber-100 text-amber-800"
                }>
                  {subscription.isExpired ? "Vencido" : 
                   subscription.status === 'active' ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Validade:</span>
                <span>{subscription.formattedStartDate} - {subscription.formattedEndDate}</span>
              </div>
              {subscription.daysUntilExpiration !== null && !subscription.isExpired && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dias restantes:</span>
                  <span className={subscription.daysUntilExpiration <= 7 ? "text-amber-600 font-medium" : "font-medium"}>
                    {subscription.daysUntilExpiration} dias
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <UserInfo user={userInfoData} />
      <UserStats stats={stats} />

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
