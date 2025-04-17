
import { useState, useEffect } from "react";
import { fetchClasses } from "@/api/classApi";
import { fetchAttendance } from "@/api/attendanceApi";
import { fetchUsers } from "@/api/userApi";
import { toast } from "sonner";
import { Class, User } from "@/types";
import { addDays } from "date-fns";

const fetchDataWithRetry = async (fetchFunction: Function, errorMessage: string, retryCount: number = 3) => {
  let retries = 0;
  
  while (retries < retryCount) {
    try {
      const data = await fetchFunction();
      return data;
    } catch (error) {
      console.error(`Error fetching data (attempt ${retries + 1}/${retryCount}):`, error);
      retries++;
      
      if (retries === retryCount) {
        toast.error(errorMessage);
        return [];
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
  
  return [];
};

export const useDashboardData = (activeTab: string) => {
  const [todayClasses, setTodayClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [scheduleClasses, setScheduleClasses] = useState<Class[]>([]);
  const [loadingRetries, setLoadingRetries] = useState(0);

  // Fetch today's classes
  useEffect(() => {
    const fetchTodayClasses = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const classes = await fetchDataWithRetry(
          () => fetchClasses(today), 
          "Erro ao carregar aulas de hoje"
        );
        setTodayClasses(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Erro ao carregar aulas de hoje");
        setTodayClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayClasses();
  }, []);

  // Fetch schedule data
  useEffect(() => {
    if (activeTab === "schedule") {
      const fetchWeeklySchedule = async () => {
        setLoading(true);
        try {
          const today = new Date();
          let allClasses: Class[] = [];
          
          for (let i = 0; i < 7; i++) {
            const date = addDays(today, i);
            const classes = await fetchClasses(date);
            allClasses = [...allClasses, ...classes];
          }
          
          setScheduleClasses(allClasses);
        } catch (error) {
          console.error("Error fetching weekly schedule:", error);
          toast.error("Erro ao carregar grade horária");
          setScheduleClasses([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchWeeklySchedule();
    }
  }, [activeTab]);

  // Fetch users data
  useEffect(() => {
    if (activeTab === "users") {
      const loadUsers = async () => {
        setLoading(true);
        try {
          console.log("Carregando usuários do Supabase");
          const userData = await fetchUsers();
          console.log("Usuários carregados:", userData);
          setUsers(userData);
          if (userData.length > 0) {
            setLoadingRetries(0);
          } else if (loadingRetries < 3) {
            setLoadingRetries(prev => prev + 1);
            setTimeout(() => loadUsers(), 1000);
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Erro ao carregar usuários");
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };
      
      loadUsers();
    }
  }, [activeTab, loadingRetries]);

  // Fetch attendance data
  useEffect(() => {
    if (activeTab === "attendance") {
      const loadAttendance = async () => {
        setLoading(true);
        try {
          const attendanceData = await fetchAttendance();
          console.log("Dados de presença carregados:", attendanceData);
          setAttendance(attendanceData);
        } catch (error) {
          console.error("Error fetching attendance:", error);
          toast.error("Erro ao carregar dados de presença");
          setAttendance([]);
        } finally {
          setLoading(false);
        }
      };
      
      loadAttendance();
    }
  }, [activeTab]);

  return {
    todayClasses,
    loading,
    users,
    attendance,
    scheduleClasses,
    setUsers
  };
};
