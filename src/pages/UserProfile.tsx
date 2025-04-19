
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ProfileFormProvider, useProfileForm } from '@/contexts/ProfileFormContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import UserInfo from '@/components/profile/UserInfo';
import UserStats from '@/components/profile/UserStats';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CalendarX, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { loading, statsLoading, user, stats, setUser } = useUserProfile(userId);
  const { isEditing, setIsEditing, editForm, setEditForm } = useProfileForm();
  const isOwnProfile = authUser?.id === userId;
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionStatus(userId);
  
  // Initialize the edit form when user data is available
  useEffect(() => {
    if (user && isOwnProfile) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birth_date: user.birth_date || ''
      });
    }
  }, [user, isOwnProfile, setEditForm]);

  const memberSince = user?.created_at 
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(user.created_at))
    : 'Janeiro 2023';
    
  const initials = user?.name 
    ? user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : 'JS';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const userInfoData = {
    name: user?.name,
    email: user?.email || '',
    phone: user?.phone || null,
    birth_date: user?.birth_date || null
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
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
        .eq('id', userId);

      if (error) throw error;

      setUser(prev => ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        birth_date: editForm.birth_date || null
      }));

      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <ProfileHeader
        name={user?.name || 'Usuário'}
        memberSince={memberSince}
        avatarUrl={user?.avatar_url}
        initials={initials}
        isEditing={isEditing}
        isOwnProfile={isOwnProfile}
        onBackClick={() => navigate(-1)}
        onEditToggle={() => setIsEditing(!isEditing)}
      />
      
      {/* Subscription Card */}
      {!subscriptionLoading && subscription && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações da Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Plano atual</p>
                  <p className="font-semibold">{subscription.plans?.name || "N/A"}</p>
                </div>
                
                {subscription.isExpired ? (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    <CalendarX className="w-3.5 h-3.5 mr-1" />
                    Vencido
                  </Badge>
                ) : subscription.daysUntilExpiration !== null && subscription.daysUntilExpiration <= 7 ? (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {subscription.daysUntilExpiration} dias
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Ativo
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Início</p>
                  <p>{subscription.formattedStartDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Término</p>
                  <p>{subscription.formattedEndDate}</p>
                </div>
              </div>
              
              {subscription.hasUnpaidPayments && (
                <div className="flex items-center bg-amber-50 text-amber-800 p-2 rounded-md text-sm mt-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>Possui pagamentos pendentes</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-6">
        {isEditing && isOwnProfile ? (
          <ProfileForm 
            editForm={editForm}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        ) : (
          <>
            <UserInfo user={userInfoData} />
            <UserStats stats={stats} isLoading={statsLoading} />
          </>
        )}
      </div>
    </div>
  );
};

const UserProfileWrapper = () => (
  <ProfileFormProvider>
    <UserProfile />
  </ProfileFormProvider>
);

export default UserProfileWrapper;
