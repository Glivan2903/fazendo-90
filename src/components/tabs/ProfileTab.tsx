
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, AlertCircle, Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AvatarUpload from '@/components/profile/AvatarUpload';
import UserStats from '@/components/profile/UserStats';
import UserInfo from '@/components/profile/UserInfo';
import ProfileForm from '@/components/profile/ProfileForm';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileTabProps {
  onSignOut: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url);
  const [isEditing, setIsEditing] = useState(false);
  const { subscription, isLoading: loadingSubscription } = useSubscriptionStatus(user?.id);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    birth_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setUserProfile(data);
      setAvatarUrl(data.avatar_url);
      setEditForm({
        name: data.name || user?.user_metadata?.name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        birth_date: data.birth_date || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone || null,
          birth_date: editForm.birth_date || null
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  // Determine user status based on subscription
  const hasPaymentIssues = subscription?.hasUnpaidPayments || subscription?.isExpired;
  const profileStatus = hasPaymentIssues ? 'Pendente' : (userProfile?.status || 'Ativo');

  // Create user info object with proper typing
  const userInfoData = {
    name: userProfile?.name || user?.user_metadata?.name,
    email: userProfile?.email || user?.email,
    phone: userProfile?.phone || null,
    birth_date: userProfile?.birth_date || null
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
          <h2 className="text-xl font-bold">{userProfile?.name || user?.user_metadata?.name || 'Usuário'}</h2>
          <p className="text-sm text-gray-500">Membro desde {memberSince}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" /> Editar Perfil
            </>
          )}
        </Button>
      </div>

      {hasPaymentIssues && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {subscription?.isExpired 
              ? 'Sua assinatura está vencida. Por favor, entre em contato com a administração para renovar.'
              : 'Você possui pagamentos pendentes. Por favor, regularize sua situação.'}
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
                  subscription.hasUnpaidPayments ? "bg-amber-100 text-amber-800" :
                  subscription.status === 'active' ? "bg-green-100 text-green-800" : 
                  "bg-amber-100 text-amber-800"
                }>
                  {subscription.isExpired ? "Vencido" : 
                   subscription.hasUnpaidPayments ? "Pendente" :
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

      {isEditing ? (
        <ProfileForm 
          editForm={editForm}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      ) : (
        <UserInfo user={userInfoData} />
      )}
      
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
