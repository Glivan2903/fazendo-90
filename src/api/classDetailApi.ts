
import { ClassDetail, Attendee } from "@/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchMockClassDetails } from "./utils/mockUtils";

export const fetchClassDetails = async (classId: string): Promise<{classDetail: ClassDetail, attendees: Attendee[]}> => {
  try {
    console.log("Buscando detalhes da aula:", classId);
    
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        id,
        start_time,
        end_time,
        date,
        max_capacity,
        programs (id, name),
        profiles!coach_id (id, name, avatar_url),
        checkins (
          id,
          profiles!user_id (id, name, avatar_url)
        )
      `)
      .eq('id', classId)
      .single();
    
    if (classError || !classData) {
      console.log("Falling back to mock data for class details:", classError);
      return fetchMockClassDetails(classId);
    }
    
    console.log("Dados da aula:", classData);
    
    const attendees: Attendee[] = [];
    if (classData.checkins && Array.isArray(classData.checkins)) {
      for (const checkin of classData.checkins) {
        if (checkin.profiles) {
          attendees.push({
            id: checkin.profiles.id,
            name: checkin.profiles.name,
            avatarUrl: checkin.profiles.avatar_url
          });
        }
      }
    }
    
    console.log(`Processados ${attendees.length} participantes`);
    
    const startTimeStr = `${classData.date}T${classData.start_time}`;
    const endTimeStr = `${classData.date}T${classData.end_time}`;
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    
    const classDetail: ClassDetail = {
      id: classData.id,
      startTime,
      endTime,
      program: {
        id: classData.programs?.id || "default",
        name: classData.programs?.name || "CrossFit"
      },
      coach: {
        id: classData.profiles?.id || "default",
        name: classData.profiles?.name || "Coach",
        avatarUrl: classData.profiles?.avatar_url
      },
      maxCapacity: classData.max_capacity,
      attendeeCount: attendees.length
    };
    
    return { classDetail, attendees };
  } catch (error) {
    console.error("Error in fetchClassDetails:", error);
    toast.error("Erro ao carregar detalhes da aula");
    return fetchMockClassDetails(classId);
  }
};
