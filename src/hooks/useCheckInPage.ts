
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchClasses } from "@/api/classApi";
import { Class } from "@/types";
import { toast } from "sonner";

export const useCheckInPage = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const loadTodayClasses = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const fetchedClasses = await fetchClasses(today);
        setClasses(fetchedClasses);
      } catch (error) {
        console.error("Error fetching today's classes:", error);
        toast.error("Erro ao carregar aulas de hoje");
      } finally {
        setLoading(false);
      }
    };
    
    loadTodayClasses();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleClassClick = (classId: string) => {
    navigate(`/class/${classId}`);
  };

  return {
    activeTab,
    classes,
    loading,
    user,
    signOut,
    handleTabChange,
    handleClassClick,
  };
};
