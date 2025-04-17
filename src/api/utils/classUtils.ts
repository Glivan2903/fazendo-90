
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Helper to fetch a class by ID
export const fetchClassById = async (classId: string) => {
  const { data, error } = await supabase
    .from('classes')
    .select('id, date')
    .eq('id', classId)
    .single();
  
  if (error) {
    console.error("Error fetching class:", error);
    return null;
  }
  
  return data;
};

// Check for conflicting check-ins for a user on the same day as a specific class
export const checkUserCheckinConflicts = async (userId: string, classId: string): Promise<{
  hasConflict: boolean;
  conflictClass?: {
    id: string;
    name: string;
    time: string;
  }
}> => {
  // First, obtain the class date
  const classData = await fetchClassById(classId);
  if (!classData) {
    return { hasConflict: false };
  }
  
  const classDate = format(new Date(classData.date), 'yyyy-MM-dd');
  
  // Fetch all of the user's check-ins for the same day, excluding the current class
  const { data: userCheckins, error: checkinsError } = await supabase
    .from('checkins')
    .select(`
      id,
      class_id,
      classes (id, date, start_time, end_time, programs(name))
    `)
    .eq('user_id', userId)
    .neq('class_id', classId);
  
  if (checkinsError) {
    console.error("Error fetching user check-ins:", checkinsError);
    return { hasConflict: false };
  }
  
  if (userCheckins && userCheckins.length > 0) {
    // Filter check-ins from the same day
    const sameDayCheckins = userCheckins.filter(checkin => {
      if (!checkin.classes || !checkin.classes.date) return false;
      return checkin.classes.date === classDate;
    });
    
    if (sameDayCheckins.length > 0) {
      const conflictingClass = sameDayCheckins[0];
      return {
        hasConflict: true,
        conflictClass: {
          id: conflictingClass.class_id,
          name: conflictingClass.classes?.programs?.name || "Aula",
          time: conflictingClass.classes?.start_time || "00:00"
        }
      };
    }
  }
  
  return { hasConflict: false };
};

// Verify class capacity and existing user check-in
export const verifyClassAvailability = async (classId: string, userId: string) => {
  const { data: classDetails, error: classError } = await supabase
    .from('classes')
    .select(`
      id,
      max_capacity,
      checkins (id, user_id)
    `)
    .eq('id', classId)
    .single();
    
  if (classError || !classDetails) {
    console.error("Class not found or error:", classError);
    toast.error("Aula não encontrada");
    return {
      classExists: false,
      hasCapacity: false,
      userCheckedIn: false
    };
  }
  
  const checkins = Array.isArray(classDetails.checkins) ? classDetails.checkins : [];
  const userCheckin = checkins.find(checkin => checkin.user_id === userId);
  
  return {
    classExists: true,
    hasCapacity: checkins.length < classDetails.max_capacity,
    userCheckedIn: !!userCheckin
  };
};
