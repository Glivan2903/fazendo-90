
import { useState, useEffect } from "react";
import { Class } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDateRange } from "@/utils/dateUtils";
import { fetchClassesForDay, saveClass, deleteClass } from "@/services/classService";
import { useClassForm } from "./use-class-form";

export const useSchedule = (initialClasses: Class[]) => {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState(getDateRange(new Date()));
  
  const {
    formData,
    setFormData,
    handleDateChange,
    handleProgramChange,
    handleCoachChange,
    handleTimeChange,
    handleCapacityChange,
    resetForm
  } = useClassForm(programs, coaches);
  
  useEffect(() => {
    fetchWeeklySchedule();
    fetchPrograms();
    fetchCoaches();
  }, [selectedDate, dateRange]);
  
  const fetchWeeklySchedule = async () => {
    try {
      setLoading(true);
      let allClasses: Class[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(dateRange.start);
        date.setDate(date.getDate() + i);
        const fetchedClasses = await fetchClassesForDay(date);
        allClasses = [...allClasses, ...fetchedClasses];
      }
      
      setClasses(allClasses);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Erro ao carregar grade horária");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase.from("programs").select("id, name");
      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([{ id: "default", name: "CrossFit" }]);
    }
  };
  
  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("role", "coach");
      
      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      setCoaches([]);
    }
  };
  
  const handleSaveClass = async () => {
    try {
      setLoading(true);
      if (!formData.programId || !formData.coachId) {
        toast.error("Selecione um programa e um coach");
        return;
      }
      
      const success = await saveClass(formData, selectedClass?.id);
      if (success) {
        setShowNewDialog(false);
        setShowEditDialog(false);
        fetchWeeklySchedule();
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClass = async () => {
    if (!selectedClass?.id) return;
    
    try {
      setDeleteLoading(true);
      const success = await deleteClass(selectedClass.id);
      if (success) {
        setShowEditDialog(false);
        fetchWeeklySchedule();
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const getClassDataForDayAndHour = (day: number, hour: string) => {
    return classes.filter(cls => {
      try {
        if (!cls.startTime) return false;
        const classDate = new Date(cls.startTime);
        const classHour = classDate.getHours().toString().padStart(2, "0") + ":00";
        const dayOfWeek = classDate.getDay();
        return dayOfWeek === day && classHour === hour;
      } catch (error) {
        console.error("Error filtering class", error);
        return false;
      }
    });
  };

  const handlePrevWeek = () => {
    const newStart = new Date(dateRange.start);
    newStart.setDate(newStart.getDate() - 7);
    setDateRange(getDateRange(newStart));
  };
  
  const handleNextWeek = () => {
    const newStart = new Date(dateRange.start);
    newStart.setDate(newStart.getDate() + 7);
    setDateRange(getDateRange(newStart));
  };

  const resetToCurrentWeek = () => {
    setDateRange(getDateRange(new Date()));
  };
  
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const resetToToday = () => {
    setSelectedDate(new Date());
  };
  
  const openNewDialog = () => {
    resetForm(programs, coaches);
    setSelectedClass(null);
    setShowNewDialog(true);
  };
  
  const openEditDialog = (classData: any) => {
    if (!classData || !classData.startTime) {
      console.error("Invalid class data", classData);
      toast.error("Dados inválidos da aula");
      return;
    }
    
    try {
      const startTime = new Date(classData.startTime);
      const endTime = new Date(classData.endTime);
      
      setFormData({
        programId: classData.program?.id || "",
        programName: classData.program?.name || classData.programName || "",
        date: startTime,
        startHour: startTime.getHours().toString().padStart(2, "0"),
        startMinute: startTime.getMinutes().toString().padStart(2, "0"),
        endHour: endTime.getHours().toString().padStart(2, "0"),
        endMinute: endTime.getMinutes().toString().padStart(2, "0"),
        maxCapacity: classData.maxCapacity || 15,
        coachId: classData.coach?.id || "",
        coachName: classData.coach?.name || classData.coachName || ""
      });
      
      setSelectedClass(classData);
      setShowEditDialog(true);
    } catch (error) {
      console.error("Error parsing class data", error);
      toast.error("Erro ao processar dados da aula");
    }
  };
  
  return {
    classes,
    loading,
    selectedDate,
    showNewDialog,
    showEditDialog,
    selectedClass,
    deleteLoading,
    formData,
    programs,
    coaches,
    dateRange,
    setShowNewDialog,
    setShowEditDialog,
    handleSaveClass,
    handleDeleteClass,
    handleDateChange,
    handleProgramChange,
    handleCoachChange,
    handleTimeChange,
    handleCapacityChange,
    openNewDialog,
    openEditDialog,
    getClassDataForDayAndHour,
    handlePrevWeek,
    handleNextWeek,
    resetToCurrentWeek,
    handlePrevDay,
    handleNextDay,
    resetToToday
  };
};
