
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserPlansManagement from '@/components/dashboard/users/UserPlansManagement';
import UserBankInvoices from '@/components/dashboard/users/UserBankInvoices';
import UserCheckinHistory from '@/components/dashboard/users/UserCheckinHistory';
import { Card } from '@/components/ui/card';
import UserProfileForm from '@/components/profile/admin/UserProfileForm';
import UserProfileNotes from '@/components/profile/admin/UserProfileNotes';

interface UserProfileTabsProps {
  userId: string;
  profile: any;
  isEditing: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

const UserProfileTabs: React.FC<UserProfileTabsProps> = ({
  userId,
  profile,
  isEditing,
  activeTab,
  setActiveTab,
  onSave,
  onCancel
}) => {
  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="plans">Planos</TabsTrigger>
        <TabsTrigger value="financials">Faturas</TabsTrigger>
        <TabsTrigger value="checkins">Check-ins</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card className="p-6">
          <UserProfileForm
            profile={profile}
            isEditing={isEditing}
            onSave={onSave}
            onCancel={onCancel}
          />
        </Card>

        <Card className="p-6 mt-6">
          <UserProfileNotes
            notes={profile.notes}
            isEditing={isEditing}
            onSave={(notes) => onSave({ notes })}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="plans">
        <UserPlansManagement userId={userId} />
      </TabsContent>
      
      <TabsContent value="financials">
        <UserBankInvoices userId={userId} />
      </TabsContent>
      
      <TabsContent value="checkins">
        <UserCheckinHistory 
          userId={userId} 
          checkins={[]} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default UserProfileTabs;
