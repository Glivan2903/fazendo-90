
import React from 'react';
import { useParams } from 'react-router-dom';
import UserProfileHeader from '@/components/profile/user-profile/UserProfileHeader';
import UserProfileTabs from '@/components/profile/user-profile/UserProfileTabs';
import UserProfileActions from '@/components/profile/admin/UserProfileActions';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useUserProfileAdmin } from '@/hooks/useUserProfileAdmin';

const UserProfileAdmin = () => {
  const { userId } = useParams<{ userId: string }>();
  const {
    profile,
    isEditing,
    setIsEditing,
    loading,
    checkinsCount,
    activeTab,
    setActiveTab,
    handleSave,
  } = useUserProfileAdmin(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1">
          <UserProfileHeader
            profile={profile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            checkinsCount={checkinsCount}
          />
          <Card className="p-6 mt-6">
            <UserProfileActions userId={userId || ''} />
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <UserProfileTabs
            userId={userId || ''}
            profile={profile}
            isEditing={isEditing}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfileAdmin;
