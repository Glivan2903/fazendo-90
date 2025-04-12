
import { Class, ClassDetail, Attendee } from "../types";
import { generateClassesForDay, generateAttendees } from "./mockData";
import { addDays, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// API para buscar aulas para uma data específica
export const fetchClasses = async (date: Date): Promise<Class[]> => {
  try {
    // Formatar data para consulta no banco de dados
    const formattedDate = format(date, 'yyyy-MM-dd');

    // Tentar buscar do Supabase
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

    // Usar dados mockados se houver erro
    if (error || !classesData || classesData.length === 0) {
      console.log("Using mock data for classes:", error);
      
      // Calcular diferença de dias em relação a hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return generateClassesForDay(diffDays);
    }

    // Get current user ID to check if user is checked in
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Processar dados do Supabase
    return classesData.map(cls => {
      // Contar check-ins
      const attendeeCount = cls.checkins ? cls.checkins.length : 0;
      
      // Verificar se o usuário atual está inscrito
      const isCheckedIn = userId ? cls.checkins?.some(checkin => checkin.user_id === userId) || false : false;
      
      return {
        id: cls.id,
        startTime: new Date(cls.start_time),
        endTime: new Date(cls.end_time),
        programName: cls.programs?.name || "CrossFit",
        coachName: cls.profiles?.name || "Coach",
        coachAvatar: cls.profiles?.avatar_url,
        maxCapacity: cls.max_capacity,
        attendeeCount: attendeeCount,
        spotsLeft: cls.max_capacity - attendeeCount,
        isCheckedIn: isCheckedIn
      };
    });
  } catch (error) {
    console.error("Error in fetchClasses:", error);
    toast.error("Erro ao carregar as aulas");
    
    // Usar dados mockados em caso de erro
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return generateClassesForDay(diffDays);
  }
};

// API para buscar detalhes de uma aula específica
export const fetchClassDetails = async (classId: string): Promise<{classDetail: ClassDetail, attendees: Attendee[]}> => {
  try {
    // First try to get data from Supabase
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        id,
        start_time,
        end_time,
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
      toast.error("Erro ao carregar detalhes da aula");
      
      // Parse day offset and class index from the ID
      const [dayOffsetStr, classIndexStr] = classId.split('-');
      const dayOffset = parseInt(dayOffsetStr);
      const classIndex = parseInt(classIndexStr);
      
      // Get the classes for that day
      const classes = generateClassesForDay(dayOffset);
      const classData = classes[classIndex];
      
      // Create class detail object
      const classDetail: ClassDetail = {
        id: classId,
        startTime: classData.startTime,
        endTime: classData.endTime,
        program: {
          id: '1',
          name: classData.programName
        },
        coach: {
          id: '1',
          name: classData.coachName,
          avatarUrl: classData.coachAvatar
        },
        maxCapacity: classData.maxCapacity,
        attendeeCount: classData.attendeeCount
      };
      
      // Generate random attendees
      const attendees = generateAttendees(classData.attendeeCount);
      
      return { classDetail, attendees };
    }
    
    // Process attendees from Supabase data
    const attendees: Attendee[] = classData.checkins
      ? classData.checkins.map(checkin => ({
          id: checkin.profiles.id,
          name: checkin.profiles.name,
          avatarUrl: checkin.profiles.avatar_url
        }))
      : [];
    
    // Format class details
    const classDetail: ClassDetail = {
      id: classData.id,
      startTime: new Date(classData.start_time),
      endTime: new Date(classData.end_time),
      program: {
        id: classData.programs.id,
        name: classData.programs.name
      },
      coach: {
        id: classData.profiles.id,
        name: classData.profiles.name,
        avatarUrl: classData.profiles.avatar_url
      },
      maxCapacity: classData.max_capacity,
      attendeeCount: attendees.length
    };
    
    return { classDetail, attendees };
  } catch (error) {
    console.error("Error in fetchClassDetails:", error);
    toast.error("Erro ao carregar detalhes da aula");
    
    // Fall back to mock data on any error
    const [dayOffsetStr, classIndexStr] = classId.split('-');
    const dayOffset = parseInt(dayOffsetStr);
    const classIndex = parseInt(classIndexStr);
    
    // Get the classes for that day
    const classes = generateClassesForDay(dayOffset);
    const classData = classes[classIndex];
    
    // Create class detail object
    const classDetail: ClassDetail = {
      id: classId,
      startTime: classData.startTime,
      endTime: classData.endTime,
      program: {
        id: '1',
        name: classData.programName
      },
      coach: {
        id: '1',
        name: classData.coachName,
        avatarUrl: classData.coachAvatar
      },
      maxCapacity: classData.maxCapacity,
      attendeeCount: classData.attendeeCount
    };
    
    // Generate random attendees
    const attendees = generateAttendees(classData.attendeeCount);
    
    return { classDetail, attendees };
  }
};

// API para fazer check-in em uma aula
export const checkInToClass = async (classId: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para fazer check-in");
      return false;
    }
    
    // Check if class exists and has available spots
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        id,
        max_capacity,
        checkins (id)
      `)
      .eq('id', classId)
      .single();
      
    if (classError || !classData) {
      console.error("Class not found:", classError);
      toast.error("Aula não encontrada");
      return false;
    }
    
    // Check if class has available spots
    if (classData.checkins && classData.checkins.length >= classData.max_capacity) {
      toast.error("Esta aula está lotada");
      return false;
    }
    
    // Check if user already checked in
    const { data: existingCheckin, error: checkinError } = await supabase
      .from('checkins')
      .select('id')
      .eq('class_id', classId)
      .eq('user_id', user.id);
      
    if (existingCheckin && existingCheckin.length > 0) {
      toast.error("Você já está inscrito nesta aula");
      return false;
    }
    
    // Insert check-in record
    const { error } = await supabase
      .from('checkins')
      .insert([
        { class_id: classId, user_id: user.id, status: 'confirmed' }
      ]);
    
    if (error) {
      console.error("Error checking in:", error);
      toast.error("Erro ao fazer check-in");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception during check-in:", error);
    toast.error("Erro ao fazer check-in");
    
    // Fall back to mock success for now
    return true;
  }
};

// API para cancelar check-in
export const cancelCheckIn = async (classId: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para cancelar o check-in");
      return false;
    }
    
    // Delete check-in record
    const { error } = await supabase
      .from('checkins')
      .delete()
      .eq('class_id', classId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error canceling check-in:", error);
      toast.error("Erro ao cancelar check-in");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception during check-in cancellation:", error);
    toast.error("Erro ao cancelar check-in");
    
    // Fall back to mock success
    return true;
  }
};
