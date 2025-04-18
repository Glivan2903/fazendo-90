
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const useAttendanceStats = () => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const { data: stats } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: async () => {
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Get today's check-ins
      const { data: todayData, error: todayError } = await supabase
        .from('checkins')
        .select('id')
        .eq('status', 'confirmed')
        .gte('checked_in_at', todayStart)
        .lte('checked_in_at', todayEnd);

      if (todayError) throw todayError;

      // Get total check-ins
      const { data: totalData, error: totalError } = await supabase
        .from('checkins')
        .select('id')
        .eq('status', 'confirmed');

      if (totalError) throw totalError;

      // Get active users (users with at least one check-in in the last 30 days)
      const { data: activeUsers, error: activeError } = await supabase
        .from('checkins')
        .select('user_id')
        .eq('status', 'confirmed')
        .gte('checked_in_at', thirtyDaysAgo.toISOString());

      if (activeError) throw activeError;

      // Get unique user IDs
      const uniqueUserIds = [...new Set(activeUsers.map(item => item.user_id))];

      return {
        todayCheckins: todayData.length,
        totalCheckins: totalData.length,
        activeUsers: uniqueUserIds.length
      };
    }
  });

  const { data: dailyCheckins } = useQuery({
    queryKey: ['daily-checkins'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_checkins', {
        start_date: thirtyDaysAgo.toISOString(),
        end_date: today.toISOString()
      });

      if (error) throw error;
      return data;
    }
  });

  const { data: topUsers } = useQuery({
    queryKey: ['top-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_checkin_counts')
        .select('*')
        .order('total_checkins', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  return {
    stats: stats || { todayCheckins: 0, totalCheckins: 0, activeUsers: 0 },
    dailyCheckins: dailyCheckins || [],
    topUsers: topUsers || []
  };
};
