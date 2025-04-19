
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import UserProfileHeader from '@/components/profile/admin/UserProfileHeader';
import UserProfileForm from '@/components/profile/admin/UserProfileForm';
import UserProfileNotes from '@/components/profile/admin/UserProfileNotes';
import UserProfileActions from '@/components/profile/admin/UserProfileActions';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import UserPlansManagement from '@/components/dashboard/users/UserPlansManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserCheckinHistory from '@/components/dashboard/users/UserCheckinHistory';
import UserBankInvoices from '@/components/dashboard/users/UserBankInvoices';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  gender: string;
  address: string | null;
  plan: string | null;
  status: string;
  created_at: string;
  notes: string | null;
  avatar_url: string | null;
  role: string;
}

const UserProfileAdmin = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkinsCount, setCheckinsCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserProfile();
    fetchCheckinsCount();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckinsCount = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_checkin_counts')
        .select('total_checkins')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setCheckinsCount(data?.total_checkins || 0);
    } catch (error) {
      console.error('Error fetching checkins count:', error);
    }
  };

  const handleSave = async (updatedProfile: Partial<UserProfile>) => {
    try {
      console.log('Updating profile with:', updatedProfile);
      
      // Handle empty birth_date to prevent PostgreSQL date format errors
      if (updatedProfile.birth_date === '') {
        updatedProfile.birth_date = null;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', userId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

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
          <Card className="p-6">
            <UserProfileHeader
              profile={profile}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              checkinsCount={checkinsCount}
            />
            <UserProfileActions userId={userId} />
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
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
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              </Card>

              <Card className="p-6 mt-6">
                <UserProfileNotes
                  notes={profile.notes}
                  isEditing={isEditing}
                  onSave={(notes) => handleSave({ notes })}
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
        </div>
      </div>
    </div>
  );
};

export default UserProfileAdmin;
