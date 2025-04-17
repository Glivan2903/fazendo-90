
import { Class, ClassDetail, Attendee } from "../types";
import { generateClassesForDay, generateAttendees } from "./mockData";
import { addDays, format, isValid } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const checkInToClass = async (classId: string): Promise<boolean | { hasConflict: boolean; conflictClass?: { id: string; name: string; time: string } }> => {
  try {
    console.log("Realizando check-in para a aula:", classId);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para fazer check-in");
      return false;
    }
    
    // Verificar se o usuário já tem check-in em outra aula no mesmo dia
    const classData = await fetchClassById(classId);
    if (!classData) {
      toast.error("Aula não encontrada");
      return false;
    }
    
    const classDate = format(new Date(classData.date), 'yyyy-MM-dd');
    
    // Buscar todos os check-ins do usuário para o mesmo dia
    const { data: userCheckins, error: checkinsError } = await supabase
      .from('checkins')
      .select(`
        id,
        class_id,
        classes (id, date, start_time, end_time, programs(name))
      `)
      .eq('user_id', user.id)
      .neq('class_id', classId);
    
    if (checkinsError) {
      console.error("Erro ao buscar check-ins do usuário:", checkinsError);
    } else if (userCheckins && userCheckins.length > 0) {
      // Filtrar check-ins do mesmo dia
      const sameDayCheckins = userCheckins.filter(checkin => {
        if (!checkin.classes || !checkin.classes.date) return false;
        return checkin.classes.date === classDate;
      });
      
      if (sameDayCheckins.length > 0) {
        // O usuário já tem check-in em outra aula no mesmo dia
        // Retornaremos um objeto especial para indicar conflito
        console.log("Usuário já tem check-in em outra aula no mesmo dia:", sameDayCheckins);
        
        return {
          hasConflict: true,
          conflictClass: {
            id: sameDayCheckins[0].class_id,
            name: sameDayCheckins[0].classes?.programs?.name || "Aula",
            time: sameDayCheckins[0].classes?.start_time || "00:00"
          }
        };
      }
    }
    
    // Verificar lotação da aula
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
      return false;
    }
    
    const checkins = Array.isArray(classDetails.checkins) ? classDetails.checkins : [];
    console.log(`Aula tem ${checkins.length}/${classDetails.max_capacity} vagas ocupadas`);
    
    if (checkins.length >= classDetails.max_capacity) {
      toast.error("Esta aula está lotada");
      return false;
    }
    
    const userCheckin = checkins.find(checkin => checkin.user_id === user.id);
    if (userCheckin) {
      toast.error("Você já está inscrito nesta aula");
      return false;
    }
    
    // Inserir check-in
    const { data: insertData, error: insertError } = await supabase
      .from('checkins')
      .insert([
        { class_id: classId, user_id: user.id, status: 'confirmed' }
      ])
      .select();
    
    if (insertError) {
      console.error("Error checking in:", insertError);
      toast.error("Erro ao fazer check-in");
      return false;
    }
    
    console.log("Check-in realizado com sucesso:", insertData);
    return true;
  } catch (error) {
    console.error("Exception during check-in:", error);
    toast.error("Erro ao fazer check-in");
    return false;
  }
};

// Função auxiliar para buscar uma aula pelo ID
const fetchClassById = async (classId: string) => {
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
    return true;
  } catch (error) {
    console.error("Exception during check-in cancellation:", error);
    toast.error("Erro ao cancelar check-in");
    return false;
  }
};

// Nova função para verificar se há check-ins em outras aulas no mesmo dia
export const checkConflictingCheckins = async (classId: string): Promise<{
  hasConflict: boolean;
  conflictClass?: {
    id: string;
    name: string;
    time: string;
  };
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      return { hasConflict: false };
    }
    
    // Primeiro, obter a data da aula atual
    const classData = await fetchClassById(classId);
    if (!classData) {
      return { hasConflict: false };
    }
    
    const classDate = format(new Date(classData.date), 'yyyy-MM-dd');
    
    // Buscar todos os check-ins do usuário para o mesmo dia
    const { data: userCheckins, error: checkinsError } = await supabase
      .from('checkins')
      .select(`
        id,
        class_id,
        classes (id, date, start_time, end_time, programs(name))
      `)
      .eq('user_id', user.id)
      .neq('class_id', classId);
    
    if (checkinsError) {
      console.error("Erro ao buscar check-ins do usuário:", checkinsError);
      return { hasConflict: false };
    }
    
    if (userCheckins && userCheckins.length > 0) {
      // Filtrar check-ins do mesmo dia
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
  } catch (error) {
    console.error("Error checking conflicting check-ins:", error);
    return { hasConflict: false };
  }
};

// Nova função para alterar check-in de uma aula para outra
export const changeCheckIn = async (fromClassId: string, toClassId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para alterar o check-in");
      return false;
    }
    
    console.log(`Alterando check-in: de ${fromClassId} para ${toClassId}`);
    
    // Primeiro, cancelar o check-in atual
    const { error: deleteError } = await supabase
      .from('checkins')
      .delete()
      .eq('class_id', fromClassId)
      .eq('user_id', user.id);
      
    if (deleteError) {
      console.error("Erro ao cancelar check-in anterior:", deleteError);
      toast.error("Erro ao cancelar o check-in anterior");
      return false;
    }
    
    console.log("Check-in anterior cancelado com sucesso");
    
    // Depois, fazer check-in na nova aula
    // Verificar lotação da aula primeiro
    const { data: classDetails, error: classError } = await supabase
      .from('classes')
      .select(`
        id,
        max_capacity,
        checkins (id, user_id)
      `)
      .eq('id', toClassId)
      .single();
      
    if (classError || !classDetails) {
      console.error("Aula não encontrada:", classError);
      toast.error("Aula não encontrada");
      
      // Tentar restaurar o check-in anterior
      await supabase
        .from('checkins')
        .insert([
          { class_id: fromClassId, user_id: user.id, status: 'confirmed' }
        ]);
        
      return false;
    }
    
    const checkins = Array.isArray(classDetails.checkins) ? classDetails.checkins : [];
    
    if (checkins.length >= classDetails.max_capacity) {
      toast.error("A aula selecionada está lotada");
      
      // Tentar restaurar o check-in anterior
      await supabase
        .from('checkins')
        .insert([
          { class_id: fromClassId, user_id: user.id, status: 'confirmed' }
        ]);
        
      return false;
    }
    
    // Inserir o novo check-in
    const { data: insertData, error: insertError } = await supabase
      .from('checkins')
      .insert([
        { class_id: toClassId, user_id: user.id, status: 'confirmed' }
      ])
      .select();
    
    if (insertError) {
      console.error("Erro ao fazer check-in na nova aula:", insertError);
      toast.error("Erro ao fazer check-in na nova aula");
      
      // Tentar restaurar o check-in anterior
      await supabase
        .from('checkins')
        .insert([
          { class_id: fromClassId, user_id: user.id, status: 'confirmed' }
        ]);
        
      return false;
    }
    
    console.log("Check-in na nova aula realizado com sucesso:", insertData);
    toast.success("Check-in alterado com sucesso!");
    return true;
  } catch (error) {
    console.error("Exception during check-in change:", error);
    toast.error("Erro ao alterar check-in");
    return false;
  }
};
