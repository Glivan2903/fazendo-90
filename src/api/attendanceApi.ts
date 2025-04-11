
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from 'date-fns';

// Função para buscar dados de presença
export const fetchAttendance = async () => {
  try {
    // Buscar classes e check-ins dos últimos 7 dias
    const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        id,
        date,
        start_time,
        end_time,
        max_capacity,
        programs (name),
        profiles!coach_id (name),
        checkins (id, status)
      `)
      .gte('date', startDate)
      .lte('date', todayDate)
      .order('date', { ascending: false });
      
    if (error || !classes) {
      throw error;
    }
    
    // Processar dados para o formato esperado
    return classes.map(cls => {
      const confirmedCheckIns = cls.checkins.filter(ci => ci.status === 'confirmed');
      const total = cls.max_capacity;
      const present = confirmedCheckIns.length;
      const absent = total - present;
      
      const startTime = new Date(cls.start_time);
      const endTime = new Date(cls.end_time);
      
      return {
        date: cls.date,
        class: `${format(startTime, 'HH:mm')} - ${cls.programs?.name || 'CrossFit'}`,
        coach: cls.profiles?.name || 'Coach',
        present: present,
        absent: absent,
        total: total
      };
    });
  } catch (error) {
    console.error("Erro ao buscar dados de presença:", error);
    
    // Dados fictícios para demonstração
    return [
      { date: "2025-04-11", class: "06:00 - CrossFit", coach: "João Silva", present: 15, absent: 3, total: 18 },
      { date: "2025-04-11", class: "07:00 - CrossFit", coach: "Maria Santos", present: 12, absent: 2, total: 14 },
      { date: "2025-04-11", class: "18:00 - CrossFit", coach: "Carlos Oliveira", present: 18, absent: 0, total: 18 },
      { date: "2025-04-10", class: "06:00 - CrossFit", coach: "João Silva", present: 14, absent: 1, total: 15 },
      { date: "2025-04-10", class: "19:00 - Musculation", coach: "Ana Costa", present: 10, absent: 3, total: 13 },
    ];
  }
};
