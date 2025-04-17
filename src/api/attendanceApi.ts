
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from 'date-fns';
import { toast } from "sonner";

// Função para buscar dados de presença
export const fetchAttendance = async (date?: Date) => {
  try {
    // Buscar classes e check-ins da data especificada ou dos últimos 7 dias
    const startDate = date ? format(date, 'yyyy-MM-dd') : format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const endDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    
    console.log(`Buscando dados de presença de ${startDate} até ${endDate}`);
    
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        id,
        date,
        start_time,
        end_time,
        max_capacity,
        programs (id, name),
        profiles!coach_id (id, name),
        checkins (id, status)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
      
    if (error) {
      console.error("Erro ao buscar dados de presença:", error);
      toast.error("Erro ao carregar dados de presença");
      throw error;
    }
    
    if (!classes || classes.length === 0) {
      console.log("Nenhum dado de presença encontrado");
      return [];
    }
    
    console.log("Dados de presença encontrados:", classes.length);
    
    // Processar dados para o formato esperado
    return classes.map(cls => {
      const confirmedCheckIns = Array.isArray(cls.checkins) 
        ? cls.checkins.filter(ci => ci.status === 'confirmed')
        : [];
      
      const total = cls.max_capacity;
      const present = confirmedCheckIns.length;
      const absent = total - present;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return {
        id: cls.id,
        date: cls.date,
        startTime: cls.start_time,
        endTime: cls.end_time,
        class: `${cls.start_time.substring(0, 5)} - ${cls.programs?.name || 'CrossFit'}`,
        coach: cls.profiles?.name || 'Coach',
        programName: cls.programs?.name || 'CrossFit',
        present,
        absent,
        total,
        rate
      };
    });
  } catch (error) {
    console.error("Erro ao buscar dados de presença:", error);
    toast.error("Erro ao carregar dados de presença");
    
    // Retornar array vazio em caso de erro
    return [];
  }
};

// Função para buscar alunos de uma aula específica
export const fetchClassAttendees = async (classId: string) => {
  try {
    console.log("Buscando alunos da aula:", classId);
    
    const { data, error } = await supabase
      .from('checkins')
      .select(`
        id,
        status,
        profiles!user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('class_id', classId);
      
    if (error) {
      console.error("Erro ao buscar alunos:", error);
      toast.error("Erro ao carregar lista de alunos");
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("Nenhum aluno encontrado para esta aula");
      return [];
    }
    
    console.log("Alunos encontrados:", data.length);
    
    // Transformar os dados para o formato esperado
    return data.map(checkin => ({
      id: checkin.profiles.id,
      name: checkin.profiles.name,
      avatarUrl: checkin.profiles.avatar_url,
      status: checkin.status
    }));
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    toast.error("Erro ao carregar lista de alunos");
    return [];
  }
};
