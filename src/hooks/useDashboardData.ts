
import { useState, useEffect } from "react";
import { fetchClasses, fetchUsers, fetchAttendance } from "@/api/classApi";
import { User } from "@/types";
import { toast } from "sonner";

export const useDashboardData = (activeTab: string) => {
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [scheduleClasses, setScheduleClasses] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === "overview") {
          const today = new Date();
          const classesData = await fetchClasses(today);
          setTodayClasses(classesData);
        } else if (activeTab === "schedule") {
          const scheduleData = await fetchClasses(new Date());
          setScheduleClasses(scheduleData);
        } else if (activeTab === "users") {
          const usersData = await fetchUsers();
          setUsers(usersData);
        } else if (activeTab === "attendance") {
          const attendanceData = await fetchAttendance(new Date());
          setAttendance(attendanceData);
        }
      } catch (error) {
        console.error(`Error loading data for ${activeTab} tab:`, error);
        toast.error(`Erro ao carregar dados para a aba ${activeTab}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  return {
    todayClasses,
    scheduleClasses,
    users,
    attendance,
    loading,
    setUsers,
  };
};
