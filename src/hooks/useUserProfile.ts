
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserProfile = (userId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    checkinsThisMonth: 0,
    attendanceRate: 0,
    workoutsPerWeek: 0,
    totalCheckins: 0
  });

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const userWithDefaults = {
          ...data,
          phone: data.phone || '',
          birth_date: data.birth_date || ''
        };
        
        setUser(userWithDefaults);
      }
      
      await fetchUserStats(userId);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Erro ao carregar perfil do usuário");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: string) => {
    setStatsLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(currentYear, now.getMonth() + 1, 0).toISOString();
      
      const { data: checkinCount, error: countError } = await supabase
        .from('user_checkin_counts')
        .select('total_checkins')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (countError) throw countError;
      
      const { data: monthlyCheckins, error: monthlyError } = await supabase
        .from('checkins')
        .select('id, checked_in_at')
        .eq('user_id', userId)
        .gte('checked_in_at', firstDayOfMonth)
        .lte('checked_in_at', lastDayOfMonth);
        
      if (monthlyError) throw monthlyError;
      
      const total = checkinCount?.total_checkins || 0;
      const monthly = monthlyCheckins?.length || 0;
      
      const weeksInMonth = 4;
      const workoutsPerWeek = monthly / weeksInMonth;
      const attendanceRate = Math.min(100, Math.round((workoutsPerWeek / 3) * 100));
      
      setStats({
        totalCheckins: total,
        checkinsThisMonth: monthly,
        workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10,
        attendanceRate
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  return {
    loading,
    statsLoading,
    user,
    stats,
    setUser
  };
};
