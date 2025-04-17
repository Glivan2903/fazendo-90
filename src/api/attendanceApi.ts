
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
    
    // Buscar classes diretamente
    const { data: classes, error } = await supabase
      .from('classes')
      .select('id, date, start_time, end_time, max_capacity, program_id, coach_id')
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
    
    console.log("Classes encontradas:", classes.length);
    
    // Buscar programas para obter os nomes
    const { data: programs } = await supabase
      .from('programs')
      .select('id, name');
    
    // Buscar perfis para obter nomes dos coaches
    const { data: coaches } = await supabase
      .from('profiles')
      .select('id, name')
      .in('role', ['coach', 'admin']);
    
    // Buscar check-ins para contagem
    const { data: checkinsData } = await supabase
      .from('checkins')
      .select('id, class_id, status')
      .in('class_id', classes.map(c => c.id));
    
    // Processar dados para o formato esperado
    return classes.map(cls => {
      const confirmedCheckIns = Array.isArray(checkinsData) 
        ? checkinsData.filter(ci => ci.class_id === cls.id && ci.status === 'confirmed')
        : [];
      
      const program = programs?.find(p => p.id === cls.program_id);
      const coach = coaches?.find(c => c.id === cls.coach_id);
      
      const total = cls.max_capacity || 0;
      const present = confirmedCheckIns.length;
      const absent = total - present;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return {
        id: cls.id,
        date: cls.date,
        startTime: cls.start_time,
        endTime: cls.end_time,
        class: `${cls.start_time?.substring(0, 5) || ""} - ${program?.name || 'CrossFit'}`,
        coach: coach?.name || 'Coach',
        programName: program?.name || 'CrossFit',
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
    
    // Buscar check-ins da aula específica
    const { data, error } = await supabase
      .from('checkins')
      .select('id, status, user_id')
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
    
    // Buscar informações dos usuários
    const userIds = data.map(checkin => checkin.user_id).filter(Boolean);
    
    if (userIds.length === 0) {
      return [];
    }
    
    // Buscar perfis dos usuários que fizeram check-in
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);
      
    if (profilesError) {
      console.error("Erro ao buscar perfis dos alunos:", profilesError);
      return data.map(checkin => ({
        id: checkin.user_id || "",
        name: "Usuário",
        avatarUrl: null,
        status: checkin.status
      }));
    }
    
    console.log("Alunos encontrados:", data.length);
    
    // Transformar os dados para o formato esperado
    return data.map(checkin => {
      const profile = profiles?.find(p => p.id === checkin.user_id);
      return {
        id: checkin.user_id || "",
        name: profile?.name || "Usuário",
        avatarUrl: profile?.avatar_url,
        status: checkin.status
      };
    });
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    toast.error("Erro ao carregar lista de alunos");
    return [];
  }
};
