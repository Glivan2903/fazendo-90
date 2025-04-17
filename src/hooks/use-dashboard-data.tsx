
import { useState, useEffect } from "react";
import { fetchClasses } from "../api/classApi";
import { fetchUsers, updateUser } from "@/api/userApi";
import { fetchAttendance } from "@/api/attendanceApi";
import { Class, User } from "../types";
import { toast } from "sonner";
import { addDays } from "date-fns";

export function useDashboardData() {
  const [activeTab, setActiveTab] = useState("overview");
  const [todayClasses, setTodayClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [scheduleClasses, setScheduleClasses] = useState<Class[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userEditLoading, setUserEditLoading] = useState(false);

  useEffect(() => {
    const fetchTodayClasses = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const classes = await fetchClasses(today);
        setTodayClasses(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Erro ao carregar aulas de hoje");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayClasses();
  }, []);
  
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
        } finally {
          setLoading(false);
        }
      };
      
      fetchWeeklySchedule();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "users") {
      const loadUsers = async () => {
        setLoading(true);
        try {
          const userData = await fetchUsers();
          const updatedUsers = userData.map(user => ({
            ...user,
            role: user.role === "Aluno" ? "student" : 
                 user.role === "Professor" ? "coach" : 
                 user.role === "Admin" ? "admin" : user.role
          }));
          setUsers(updatedUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Erro ao carregar usuários");
        } finally {
          setLoading(false);
        }
      };
      
      loadUsers();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "attendance") {
      const loadAttendance = async () => {
        setLoading(true);
        try {
          const attendanceData = await fetchAttendance();
          setAttendance(attendanceData);
        } catch (error) {
          console.error("Error fetching attendance:", error);
          toast.error("Erro ao carregar dados de presença");
        } finally {
          setLoading(false);
        }
      };
      
      loadAttendance();
    }
  }, [activeTab]);
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  const handleSaveUser = async (userData: User) => {
    if (!selectedUser) return;
    
    setUserEditLoading(true);
    try {
      const apiUserData = {
        ...userData
      };
      
      await updateUser(apiUserData);
      setUsers(users.map(u => u.id === userData.id ? userData : u));
      toast.success("Usuário atualizado com sucesso!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setUserEditLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    todayClasses,
    loading,
    users,
    attendance,
    scheduleClasses,
    selectedUser,
    isDialogOpen,
    setIsDialogOpen,
    userEditLoading,
    handleEditUser,
    handleSaveUser
  };
}
