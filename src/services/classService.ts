
import { Class } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateForDB, validateDate } from "@/utils/dateUtils";

export const fetchClassesForDay = async (date: Date): Promise<Class[]> => {
  try {
    const formattedDate = formatDateForDB(date);
    
    const { data, error } = await supabase
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
    
    if (error) throw error;
    
    return (data || []).map(cls => {
      try {
        const startTime = validateDate(cls.date, cls.start_time);
        const endTime = validateDate(cls.date, cls.end_time);
        const checkins = Array.isArray(cls.checkins) ? cls.checkins : [];
        const attendeeCount = checkins.length;
        
        return {
          id: cls.id,
          programName: cls.programs?.name || "CrossFit",
          coachName: cls.profiles?.name || "Coach",
          startTime,
          endTime,
          maxCapacity: cls.max_capacity,
          attendeeCount,
          spotsLeft: cls.max_capacity - attendeeCount,
          isCheckedIn: false,
          program: cls.programs,
          coach: cls.profiles,
          date: cls.date,
          created_at: new Date().toISOString()
        };
      } catch (error) {
        console.error("Error processing class:", error);
        return createDefaultClass(cls);
      }
    });
  } catch (error) {
    console.error("Error fetching classes for day:", error);
    return [];
  }
};

const createDefaultClass = (cls: any): Class => {
  const now = new Date();
  const attendeeCount = Array.isArray(cls.checkins) ? cls.checkins.length : 0;
  
  return {
    id: cls.id || crypto.randomUUID(),
    startTime: now,
    endTime: new Date(now.getTime() + 3600000),
    programName: cls.programs?.name || "CrossFit",
    coachName: cls.profiles?.name || "Coach",
    maxCapacity: cls.max_capacity || 15,
    attendeeCount,
    spotsLeft: (cls.max_capacity || 15) - attendeeCount,
    isCheckedIn: false,
    program: cls.programs,
    coach: cls.profiles,
    date: cls.date,
    created_at: now.toISOString()
  };
};

export const saveClass = async (classData: any, selectedClassId?: string) => {
  try {
    const dateStr = formatDateForDB(classData.date);
    const startTimeStr = `${classData.startHour}:${classData.startMinute}:00`;
    const endTimeStr = `${classData.endHour}:${classData.endMinute}:00`;
    
    const dataToSave = {
      date: dateStr,
      start_time: startTimeStr,
      end_time: endTimeStr,
      max_capacity: classData.maxCapacity,
      program_id: classData.programId,
      coach_id: classData.coachId
    };
    
    if (selectedClassId) {
      const { error } = await supabase
        .from("classes")
        .update(dataToSave)
        .eq("id", selectedClassId);
      
      if (error) throw error;
      toast.success("Aula atualizada com sucesso!");
    } else {
      const { error } = await supabase
        .from("classes")
        .insert([dataToSave]);
      
      if (error) throw error;
      toast.success("Aula criada com sucesso!");
    }
    
    return true;
  } catch (error) {
    console.error("Error saving class:", error);
    toast.error("Erro ao salvar a aula");
    return false;
  }
};

export const deleteClass = async (classId: string) => {
  try {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);
    
    if (error) throw error;
    toast.success("Aula excluída com sucesso!");
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    toast.error("Erro ao excluir aula");
    return false;
  }
};
