
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
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

export const useUserProfileAdmin = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkinsCount, setCheckinsCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('profile');

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
      if (!userId) return;
      
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

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchCheckinsCount();
    }
  }, [userId]);

  return {
    profile,
    isEditing,
    setIsEditing,
    loading,
    checkinsCount,
    activeTab,
    setActiveTab,
    handleSave,
  };
};
