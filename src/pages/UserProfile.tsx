
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ProfileFormProvider, useProfileForm } from '@/contexts/ProfileFormContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import UserInfo from '@/components/profile/UserInfo';
import UserStats from '@/components/profile/UserStats';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { loading, statsLoading, user, stats, setUser } = useUserProfile(userId);
  const { isEditing, setIsEditing } = useProfileForm();
  const isOwnProfile = authUser?.id === userId;
  
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
      
      <div className="space-y-6">
        {isEditing && isOwnProfile ? (
          <ProfileForm />
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
