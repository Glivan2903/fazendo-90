
import { Class } from "@/types";
import { format, isValid } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchMockClasses } from "./utils/mockUtils";

// API to fetch classes for a specific date
export const fetchClasses = async (date: Date): Promise<Class[]> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log("Buscando aulas para a data:", formattedDate);

    const { data: classesData, error } = await supabase
      .from('classes')
      .select(`
        id,
        start_time,
        end_time,
        max_capacity,
        programs (name),
        profiles!coach_id (name, avatar_url),
        checkins (id, user_id)
      `)
      .eq('date', formattedDate)
      .order('start_time', { ascending: true });

    if (error || !classesData || classesData.length === 0) {
      console.log("Using mock data for classes:", error);
      return fetchMockClasses(date);
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    console.log("Current user ID:", userId);

    return classesData.map(cls => {
      try {
        const checkins = Array.isArray(cls.checkins) ? cls.checkins : [];
        const attendeeCount = checkins.length;
        console.log(`Classe ${cls.id}: ${attendeeCount} check-ins`);
        
        const isCheckedIn = userId ? checkins.some(checkin => checkin.user_id === userId) || false : false;
        
        const spotsLeft = cls.max_capacity - attendeeCount;
        
        const startTimeStr = `${formattedDate}T${cls.start_time}`;
        const endTimeStr = `${formattedDate}T${cls.end_time}`;
        const startTime = new Date(startTimeStr);
        const endTime = new Date(endTimeStr);
        
        if (!isValid(startTime) || !isValid(endTime)) {
          console.error("Data inválida:", { startTime, endTime, cls });
          throw new Error("Data inválida");
        }
        
        return {
          id: cls.id,
          startTime,
          endTime,
          programName: cls.programs?.name || "CrossFit",
          coachName: cls.profiles?.name || "Coach",
          coachAvatar: cls.profiles?.avatar_url,
          maxCapacity: cls.max_capacity,
          attendeeCount,
          spotsLeft,
          isCheckedIn
        };
      } catch (error) {
        console.error("Erro ao processar classe:", error);
        
        const now = new Date();
        const attendeeCount = Array.isArray(cls.checkins) ? cls.checkins.length : 0;
        const isCheckedIn = userId ? (Array.isArray(cls.checkins) ? cls.checkins.some(checkin => checkin.user_id === userId) : false) : false;
        
        return {
          id: cls.id || crypto.randomUUID(),
          startTime: new Date(now),
          endTime: new Date(now.getTime() + 3600000),
          programName: cls.programs?.name || "CrossFit",
          coachName: cls.profiles?.name || "Coach",
          coachAvatar: cls.profiles?.avatar_url,
          maxCapacity: cls.max_capacity || 15,
          attendeeCount,
          spotsLeft: (cls.max_capacity || 15) - attendeeCount,
          isCheckedIn
        };
      }
    });
  } catch (error) {
    console.error("Error in fetchClasses:", error);
    toast.error("Erro ao carregar as aulas");
    return fetchMockClasses(date);
  }
};
