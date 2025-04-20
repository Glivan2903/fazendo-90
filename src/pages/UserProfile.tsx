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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AvatarUpload from '@/components/profile/AvatarUpload';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { loading, statsLoading, user, stats, setUser } = useUserProfile(userId);
  const { isEditing, setIsEditing, editForm, setEditForm } = useProfileForm();
  const isOwnProfile = authUser?.id === userId;
  
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

  const handleAvatarUpdate = (url: string) => {
    setUser(prev => ({
      ...prev,
      avatar_url: url
    }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-gray-600 mb-4"
        >
          ← Voltar
        </button>
        
        <div className="flex flex-col items-center text-center">
          <AvatarUpload
            avatarUrl={user?.avatar_url}
            userId={userId || ''}
            userInitials={initials}
            onAvatarUpdate={handleAvatarUpdate}
          />
          
          <h1 className="text-2xl font-bold mt-4">{user?.name || 'Usuário'}</h1>
          <p className="text-sm text-gray-500">Membro desde {memberSince}</p>
          
          {isOwnProfile && (
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
            >
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          )}
        </div>
      </div>
      
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
