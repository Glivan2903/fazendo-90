
import { useState, useEffect } from "react";
import { Class, Program } from "@/types";
import { format, parseISO, startOfWeek, addDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6)
  });
  
  // Form data state
  const [formData, setFormData] = useState({
    programId: "",
    programName: "",
    date: new Date(),
    startHour: "06",
    startMinute: "00",
    endHour: "07",
    endMinute: "00",
    maxCapacity: 15,
    coachId: "",
    coachName: ""
  });
  
  useEffect(() => {
    fetchWeeklySchedule();
    fetchPrograms();
    fetchCoaches();
  }, [selectedDate, dateRange]);
  
  const fetchWeeklySchedule = async () => {
    try {
      setLoading(true);
      
      let allClasses: Class[] = [];
      
      const startDate = dateRange.start;
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
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
  
  const fetchClassesForDay = async (date: Date): Promise<Class[]> => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      let query = supabase
        .from("classes")
        .select(`
          id,
          date,
          start_time,
          end_time,
          max_capacity,
          programs (id, name),
          profiles!coach_id (id, name, avatar_url, email, role, created_at),
          checkins (id, user_id)
        `)
        .eq("date", formattedDate);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data
      const transformedClasses = (data || []).map(cls => {
        try {
          const dateStr = cls.date;
          const startTimeStr = cls.start_time;
          const endTimeStr = cls.end_time;
          
          // Create valid date objects
          const startTimeDate = new Date(`${dateStr}T${startTimeStr}`);
          const endTimeDate = new Date(`${dateStr}T${endTimeStr}`);
          
          if (!isValid(startTimeDate) || !isValid(endTimeDate)) {
            console.error("Invalid date detected:", { dateStr, startTimeStr, endTimeStr });
            const now = new Date();
            return {
              id: cls.id,
              programName: cls.programs?.name || "CrossFit",
              coachName: cls.profiles?.name || "Coach",
              startTime: now,
              endTime: new Date(now.getTime() + 3600000),
              maxCapacity: cls.max_capacity,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
              isCheckedIn: false,
              program: cls.programs,
              coach: cls.profiles,
              date: dateStr,
              created_at: new Date().toISOString()
            } as Class;
          }
          
          const attendeeCount = cls.checkins ? cls.checkins.length : 0;
          
          return {
            id: cls.id,
            programName: cls.programs?.name || "CrossFit",
            coachName: cls.profiles?.name || "Coach",
            startTime: startTimeDate,
            endTime: endTimeDate,
            maxCapacity: cls.max_capacity,
            attendeeCount: attendeeCount,
            spotsLeft: cls.max_capacity - attendeeCount,
            isCheckedIn: false,
            program: cls.programs,
            coach: cls.profiles,
            date: dateStr,
            created_at: new Date().toISOString()
          } as Class;
        } catch (error) {
          console.error("Error processing class:", error);
          const now = new Date();
          return {
            id: cls.id,
            programName: cls.programs?.name || "CrossFit",
            coachName: cls.profiles?.name || "Coach",
            startTime: now,
            endTime: new Date(now.getTime() + 3600000),
            maxCapacity: cls.max_capacity,
            attendeeCount: cls.checkins ? cls.checkins.length : 0,
            spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
            isCheckedIn: false,
            program: cls.programs,
            coach: cls.profiles,
            date: cls.date,
            created_at: new Date().toISOString()
          } as Class;
        }
      });
      
      return transformedClasses;
    } catch (error) {
      console.error("Error fetching classes for day:", error);
      return [];
    }
  };
  
  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase.from("programs").select("id, name");
      
      if (error) throw error;
      
      setPrograms(data || []);
      
      // If no program is selected but we have programs, select the first one
      if ((!formData.programId || formData.programId === "") && data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          programId: data[0].id,
          programName: data[0].name
        }));
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([{ id: "default", name: "CrossFit" }]);
    }
  };
  
  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, created_at")
        .eq("role", "coach");
      
      if (error) {
        console.error("Erro ao buscar coaches:", error);
        const { data: allProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, role, email, created_at");
          
        if (profilesError) throw profilesError;
        
        const coachProfiles = allProfiles?.filter(profile => 
          profile.role === "coach"
        ) || [];
        
        setCoaches(coachProfiles);
        return;
      }
      
      setCoaches(data || []);
      
      if ((!formData.coachId || formData.coachId === "") && data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          coachId: data[0].id,
          coachName: data[0].name
        }));
      }
    } catch (error) {
      console.error("Error fetching coaches:", error);
      setCoaches([]);
    }
  };
  
  const handleSaveClass = async () => {
    try {
      setLoading(true);
      
      if (!formData.programId) {
        toast.error("Selecione um programa");
        return;
      }
      
      if (!formData.coachId) {
        toast.error("Selecione um coach");
        return;
      }
      
      // Format date as YYYY-MM-DD
      const dateStr = format(formData.date, "yyyy-MM-dd");
      
      // Create time strings
      const startTimeStr = `${formData.startHour}:${formData.startMinute}:00`;
      const endTimeStr = `${formData.endHour}:${formData.endMinute}:00`;
      
      const classDataToSave = {
        date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        max_capacity: formData.maxCapacity,
        program_id: formData.programId,
        coach_id: formData.coachId
      };
      
      if (selectedClass?.id) {
        // Update existing class
        const { error } = await supabase
          .from("classes")
          .update(classDataToSave)
          .eq("id", selectedClass.id);
        
        if (error) throw error;
        
        toast.success("Aula atualizada com sucesso!");
      } else {
        // Create new class
        const { error } = await supabase
          .from("classes")
          .insert([classDataToSave]);
        
        if (error) throw error;
        
        toast.success("Aula criada com sucesso!");
      }
      
      // Refresh classes
      fetchWeeklySchedule();
      setShowNewDialog(false);
      setShowEditDialog(false);
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      toast.error("Erro ao salvar a aula");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClass = async () => {
    if (!selectedClass?.id) return;
    
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", selectedClass.id);
      
      if (error) throw error;
      
      toast.success("Aula excluída com sucesso!");
      
      // Refresh classes
      fetchWeeklySchedule();
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Erro ao excluir aula");
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };
  
  const handleProgramChange = (value: string) => {
    const selected = programs.find(p => p.id === value);
    setFormData(prev => ({
      ...prev,
      programId: value,
      programName: selected ? selected.name : prev.programName
    }));
  };
  
  const handleCoachChange = (value: string) => {
    const selected = coaches.find(c => c.id === value);
    setFormData(prev => ({
      ...prev,
      coachId: value,
      coachName: selected ? selected.name : prev.coachName
    }));
  };
  
  const handleTimeChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCapacityChange = (value: string) => {
    const capacity = parseInt(value);
    if (!isNaN(capacity) && capacity > 0) {
      setFormData(prev => ({ ...prev, maxCapacity: capacity }));
    }
  };
  
  const openNewDialog = () => {
    const today = new Date();
    setFormData({
      programId: programs.length > 0 ? programs[0].id : "",
      programName: programs.length > 0 ? programs[0].name : "CrossFit",
      date: today,
      startHour: "06",
      startMinute: "00",
      endHour: "07",
      endMinute: "00",
      maxCapacity: 15,
      coachId: coaches.length > 0 ? coaches[0].id : "",
      coachName: coaches.length > 0 ? coaches[0].name : ""
    });
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
      const endTime = new Date(classData.endTime || startTime.getTime() + 3600000);
      
      if (!isValid(startTime)) {
        console.error("Invalid date", { startTime });
        toast.error("Data inválida");
        return;
      }
      
      setFormData({
        programId: classData.program?.id || "",
        programName: classData.program?.name || classData.programName || "",
        date: startTime,
        startHour: format(startTime, "HH"),
        startMinute: format(startTime, "mm"),
        endHour: format(endTime, "HH"),
        endMinute: format(endTime, "mm"),
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
  
  const getClassDataForDayAndHour = (day: number, hour: string) => {
    return classes.filter(cls => {
      try {
        if (!cls.startTime || !isValid(new Date(cls.startTime))) {
          return false;
        }
        
        const classDate = new Date(cls.startTime);
        const classHour = format(classDate, "HH:mm");
        const dayOfWeek = classDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        return dayOfWeek === day && classHour === hour;
      } catch (error) {
        console.error("Error filtering class", error);
        return false;
      }
    });
  };
  
  const handlePrevWeek = () => {
    const newStart = addDays(dateRange.start, -7);
    const newEnd = addDays(dateRange.end, -7);
    setDateRange({ start: newStart, end: newEnd });
  };
  
  const handleNextWeek = () => {
    const newStart = addDays(dateRange.start, 7);
    const newEnd = addDays(dateRange.end, 7);
    setDateRange({ start: newStart, end: newEnd });
  };

  const resetToCurrentWeek = () => {
    setDateRange({
      start: startOfWeek(new Date(), { weekStartsOn: 0 }),
      end: addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6)
    });
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
  
  return {
    classes,
    loading,
    selectedDate,
    viewMode: "grid",
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
