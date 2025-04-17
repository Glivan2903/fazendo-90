
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

// Function to fetch attendance data
export const fetchAttendance = async (date?: Date) => {
  try {
    console.log("Fetching attendance data", date ? `for ${format(date, 'yyyy-MM-dd')}` : "for all dates");
    
    // Base query to get class attendance information
    const query = supabase
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
      .order('date', { ascending: false });
    
    // If a date is provided, filter by that date
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      query.eq('date', formattedDate);
    } else {
      // Limit to the last 30 days if no date provided
      const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      query.gte('date', thirtyDaysAgo);
    }
    
    // Execute the query
    const { data: classesData, error } = await query;
    
    if (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
    
    if (!classesData || classesData.length === 0) {
      console.log("No attendance data found");
      return [];
    }
    
    // Transform data into the format expected by the AttendanceTab component
    const attendanceData = classesData.map(cls => {
      const checkins = Array.isArray(cls.checkins) ? cls.checkins : [];
      const confirmedCheckins = checkins.filter(c => c.status === 'confirmed');
      const present = confirmedCheckins.length;
      const total = cls.max_capacity;
      const absent = total - present;
      const rate = Math.round((present / total) * 100);
      
      return {
        id: cls.id,
        date: cls.date,
        startTime: cls.start_time,
        endTime: cls.end_time,
        class: cls.programs?.name || 'CrossFit',
        coach: cls.profiles?.name || 'Coach',
        programName: cls.programs?.name || 'CrossFit',
        present,
        absent,
        total,
        rate
      };
    });
    
    console.log(`Processed ${attendanceData.length} attendance records`);
    return attendanceData;
  } catch (error) {
    console.error("Error in fetchAttendance:", error);
    toast.error("Erro ao buscar dados de presença");
    return generateMockAttendanceData();
  }
};

// Function to fetch attendees for a specific class
export const fetchClassAttendees = async (classId: string) => {
  try {
    console.log("Fetching attendees for class:", classId);
    
    const { data: checkins, error } = await supabase
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
      console.error("Error fetching class attendees:", error);
      throw error;
    }
    
    if (!checkins || checkins.length === 0) {
      console.log("No attendees found for this class");
      return [];
    }
    
    // Transform data into the format expected by the component
    const attendees = checkins.map(checkin => ({
      id: checkin.id,
      name: checkin.profiles?.name || 'Unknown',
      avatarUrl: checkin.profiles?.avatar_url,
      status: checkin.status
    }));
    
    console.log(`Found ${attendees.length} attendees for class ${classId}`);
    return attendees;
  } catch (error) {
    console.error("Error in fetchClassAttendees:", error);
    toast.error("Erro ao buscar alunos da aula");
    return generateMockAttendees();
  }
};

// Mock data generator for fallback
const generateMockAttendanceData = () => {
  const today = new Date();
  const result = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const present = Math.floor(Math.random() * 10) + 5;
    const total = 15;
    const absent = total - present;
    const rate = Math.round((present / total) * 100);
    
    result.push({
      id: `mock-${i}`,
      date: format(date, 'yyyy-MM-dd'),
      startTime: '18:00',
      endTime: '19:00',
      class: i % 2 === 0 ? 'CrossFit' : 'Weightlifting',
      coach: i % 2 === 0 ? 'John Doe' : 'Jane Smith',
      programName: i % 2 === 0 ? 'CrossFit' : 'Weightlifting',
      present,
      absent,
      total,
      rate
    });
  }
  
  return result;
};

// Mock attendees generator
const generateMockAttendees = () => {
  const result = [];
  const statuses = ['confirmed', 'absent'];
  const names = ['Ana Silva', 'Carlos Santos', 'Mariana Oliveira', 'Pedro Costa', 'Juliana Lima', 'Roberto Almeida', 'Fernanda Souza'];
  
  for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    result.push({
      id: `mock-attendee-${i}`,
      name,
      avatarUrl: `https://api.dicebear.com/6.x/avataaars/svg?seed=${name.replace(' ', '')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  return result;
};
