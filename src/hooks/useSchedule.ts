
import { useState, useEffect } from "react";
import { Class } from "@/types";
import { format, startOfWeek, addDays, isValid } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSchedule = (initialClasses: Class[]) => {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6)
  });

  const fetchClassesForDay = async (date: Date): Promise<Class[]> => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from("classes")
        .select(`
          id,
          date,
          start_time,
          end_time,
          max_capacity,
          program_id,
          coach_id,
          programs (id, name),
          profiles!coach_id (id, name, avatar_url),
          checkins (id, user_id)
        `)
        .eq("date", formattedDate);
      
      if (error) throw error;
      
      return (data || []).map(cls => {
        try {
          const dateStr = cls.date;
          const startTimeDate = new Date(`${dateStr}T${cls.start_time}`);
          const endTimeDate = new Date(`${dateStr}T${cls.end_time}`);
          
          if (!isValid(startTimeDate) || !isValid(endTimeDate)) {
            const now = new Date();
            return createDefaultClass(cls, now);
          }
          
          const attendeeCount = cls.checkins ? cls.checkins.length : 0;
          
          return {
            id: cls.id,
            date: cls.date,
            start_time: cls.start_time,
            end_time: cls.end_time,
            max_capacity: cls.max_capacity,
            program_id: cls.program_id,
            coach_id: cls.coach_id,
            programName: cls.programs?.name || "CrossFit",
            coachName: cls.profiles?.name || "Coach",
            startTime: startTimeDate,
            endTime: endTimeDate,
            maxCapacity: cls.max_capacity,
            attendeeCount,
            spotsLeft: cls.max_capacity - attendeeCount,
            isCheckedIn: false,
            program: cls.programs,
            coach: cls.profiles
          };
        } catch (error) {
          console.error("Error processing class:", error);
          const now = new Date();
          return createDefaultClass(cls, now);
        }
      });
    } catch (error) {
      console.error("Error fetching classes for day:", error);
      return [];
    }
  };

  const createDefaultClass = (cls: any, now: Date) => ({
    id: cls.id,
    date: cls.date,
    start_time: cls.start_time,
    end_time: cls.end_time,
    max_capacity: cls.max_capacity,
    program_id: cls.program_id,
    coach_id: cls.coach_id,
    programName: cls.programs?.name || "CrossFit",
    coachName: cls.profiles?.name || "Coach",
    startTime: now,
    endTime: new Date(now.getTime() + 3600000),
    maxCapacity: cls.max_capacity,
    attendeeCount: cls.checkins ? cls.checkins.length : 0,
    spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
    isCheckedIn: false,
    program: cls.programs,
    coach: cls.profiles
  });

  const fetchWeeklySchedule = async (viewMode: "grid" | "list") => {
    try {
      setLoading(true);
      
      let allClasses: Class[] = [];
      
      if (viewMode === "grid") {
        const startDate = dateRange.start;
        
        for (let i = 0; i < 7; i++) {
          const date = addDays(startDate, i);
          const fetchedClasses = await fetchClassesForDay(date);
          allClasses = [...allClasses, ...fetchedClasses];
        }
      } else {
        const { data, error } = await supabase
          .from("classes")
          .select(`
            id,
            date,
            start_time,
            end_time,
            max_capacity,
            program_id,
            coach_id,
            programs (id, name),
            profiles!coach_id (id, name, avatar_url),
            checkins (id)
          `)
          .order('start_time', { ascending: true });
          
        if (error) throw error;
        
        allClasses = (data || []).map(cls => {
          try {
            const dateStr = cls.date;
            const startTimeDate = new Date(`${dateStr}T${cls.start_time}`);
            const endTimeDate = new Date(`${dateStr}T${cls.end_time}`);
            
            return {
              id: cls.id,
              date: dateStr,
              start_time: cls.start_time,
              end_time: cls.end_time,
              max_capacity: cls.max_capacity,
              program_id: cls.program_id,
              coach_id: cls.coach_id,
              programName: cls.programs?.name || "CrossFit",
              coachName: cls.profiles?.name || "Coach",
              startTime: startTimeDate,
              endTime: endTimeDate,
              maxCapacity: cls.max_capacity,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
              isCheckedIn: false,
              program: cls.programs,
              coach: cls.profiles
            };
          } catch (error) {
            console.error("Error processing class:", error);
            const now = new Date();
            return createDefaultClass(cls, now);
          }
        });
      }
      
      setClasses(allClasses);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Erro ao carregar grade horária");
    } finally {
      setLoading(false);
    }
  };

  return {
    classes,
    loading,
    dateRange,
    setDateRange,
    fetchWeeklySchedule,
    fetchClassesForDay
  };
};
