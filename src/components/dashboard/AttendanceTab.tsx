
import React, { useState } from 'react';
import { useAttendanceStats } from '@/hooks/useAttendanceStats';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import AttendanceStats from './attendance/AttendanceStats';
import CheckinsChart from './attendance/CheckinsChart';
import TopUsersList from './attendance/TopUsersList';
import UserHistoryDialog from './attendance/UserHistoryDialog';

const AttendanceTab = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const { stats, dailyCheckins, topUsers } = useAttendanceStats();

  const handleViewHistory = async (userId: string) => {
    const user = topUsers.find(u => u.user_id === userId);
    if (user) {
      setSelectedUserName(user.user_name);
    }

    const { data, error } = await supabase
      .from('checkins')
      .select(`
        id,
        checked_in_at,
        classes (
          date,
          programs (name),
          profiles!coach_id (name)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .order('checked_in_at', { ascending: false });

    if (!error && data) {
      const history = data.map(item => ({
        date: item.classes?.date,
        class_name: item.classes?.programs?.name || 'CrossFit',
        coach_name: item.classes?.profiles?.name || 'Coach',
        checked_in_at: item.checked_in_at
      }));
      setUserHistory(history);
    }

    setSelectedUser(userId);
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceStats {...stats} />
      <CheckinsChart data={dailyCheckins} />
      <TopUsersList users={topUsers} onViewHistory={handleViewHistory} />
      
      <UserHistoryDialog
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        userName={selectedUserName}
        history={userHistory}
      />
    </div>
  );
};

export default AttendanceTab;
