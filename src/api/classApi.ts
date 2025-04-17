import { Class, ClassDetail, Attendee } from "../types";
import { generateClassesForDay, generateAttendees } from "./mockData";
import { addDays, format, isValid } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/types/database.types";

// API para buscar aulas para uma data específica
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

const fetchMockClasses = async (date: Date): Promise<Class[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const mockClasses = generateClassesForDay(diffDays);
  
  return mockClasses.map(cls => {
    const startTime = cls.startTime instanceof Date && !isNaN(cls.startTime.getTime()) 
      ? cls.startTime 
      : new Date();
      
    const endTime = cls.endTime instanceof Date && !isNaN(cls.endTime.getTime()) 
      ? cls.endTime 
      : new Date(Date.now() + 3600000);
      
    return {
      ...cls,
      id: crypto.randomUUID(),
      startTime,
      endTime
    };
  });
};

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

const fetchMockClassDetails = async (classId: string): Promise<{classDetail: ClassDetail, attendees: Attendee[]}> => {
  try {
    let mockClassDetail: ClassDetail;
    let attendeeCount = 8;
    
    if (classId.includes('-') && !classId.includes('-', 2)) {
      const [dayOffsetStr, classIndexStr] = classId.split('-');
      const dayOffset = parseInt(dayOffsetStr);
      const classIndex = parseInt(classIndexStr);
      
      const classes = generateClassesForDay(dayOffset);
      const classData = classes[classIndex];
      attendeeCount = classData.attendeeCount;
      
      mockClassDetail = {
        id: crypto.randomUUID(),
        startTime: classData.startTime,
        endTime: classData.endTime,
        program: {
          id: crypto.randomUUID(),
          name: classData.programName
        },
        coach: {
          id: crypto.randomUUID(),
          name: classData.coachName,
          avatarUrl: classData.coachAvatar
        },
        maxCapacity: classData.maxCapacity,
        attendeeCount: classData.attendeeCount
      };
    } else {
      const now = new Date();
      mockClassDetail = {
        id: classId,
        startTime: new Date(now.setHours(now.getHours() + 1)),
        endTime: new Date(now.setHours(now.getHours() + 2)),
        program: {
          id: crypto.randomUUID(),
          name: "CrossFit"
        },
        coach: {
          id: crypto.randomUUID(),
          name: "Coach",
          avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Coach"
        },
        maxCapacity: 15,
        attendeeCount: attendeeCount
      };
    }
    
    const attendees = generateAttendees(attendeeCount);
    
    return { classDetail: mockClassDetail, attendees };
  } catch (error) {
    console.error("Error generating mock class details:", error);
    
    const mockClassDetail: ClassDetail = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      program: {
        id: crypto.randomUUID(),
        name: "CrossFit"
      },
      coach: {
        id: crypto.randomUUID(),
        name: "Coach",
        avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Coach"
      },
      maxCapacity: 15,
      attendeeCount: 5
    };
    
    const attendees = generateAttendees(5);
    
    return { classDetail: mockClassDetail, attendees };
  }
};

export const checkInToClass = async (classId: string): Promise<boolean | string> => {
  try {
    console.log("Realizando check-in para a aula:", classId);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para fazer check-in");
      return false;
    }

    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('date, start_time, end_time')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      toast.error("Aula não encontrada");
      return false;
    }

    const classDate = classData.date;
    const { data: existingCheckins, error: checkinsError } = await supabase
      .from('checkins')
      .select(`
        id,
        class_id,
        classes!inner (
          id,
          date,
          start_time,
          end_time
        )
      `)
      .eq('user_id', user.id)
      .eq('classes.date', classDate);

    if (checkinsError) {
      console.error("Error checking existing check-ins:", checkinsError);
      toast.error("Erro ao verificar check-ins existentes");
      return false;
    }

    const existingCheckIn = existingCheckins?.find(checkin => checkin.class_id === classId);
    if (existingCheckIn) {
      return true;
    }

    const conflictingCheckIn = existingCheckins?.find(checkin => checkin.class_id !== classId);
    if (conflictingCheckIn) {
      return conflictingCheckIn.class_id;
    }

    const { data: checkins } = await supabase
      .from('checkins')
      .select('id')
      .eq('class_id', classId);

    const { data: classCapacity } = await supabase
      .from('classes')
      .select('max_capacity')
      .eq('id', classId)
      .single();

    if (classCapacity && checkins && checkins.length >= classCapacity.max_capacity) {
      toast.error("Esta aula está lotada");
      return false;
    }

    const { error: insertError } = await supabase
      .from('checkins')
      .insert([
        { class_id: classId, user_id: user.id, status: 'confirmed' }
      ]);

    if (insertError) {
      console.error("Error checking in:", insertError);
      toast.error("Erro ao fazer check-in");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception during check-in:", error);
    toast.error("Erro ao fazer check-in");
    return false;
  }
};

export const cancelCheckIn = async (classId: string): Promise<boolean> => {
  try {
    console.log("Cancelando check-in para a aula:", classId);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para cancelar o check-in");
      return false;
    }
    
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
    
    console.log("Check-in cancelado com sucesso!");
    toast.success("Check-in cancelado com sucesso!");
    return true;
  } catch (error) {
    console.error("Exception during check-in cancellation:", error);
    toast.error("Erro ao cancelar check-in");
    return false;
  }
};
