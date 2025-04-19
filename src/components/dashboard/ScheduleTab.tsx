
import React, { useState, useEffect } from "react";
import { Class } from "@/types";
import { format, parseISO, startOfWeek, addDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutGrid, List, Loader2, RotateCcw, 
  Edit, Plus, Save, Trash, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import CheckInSettings from "./CheckInSettings";

interface ScheduleTabProps {
  classes: Class[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ classes: initialClasses }) => {
  const isMobile = useIsMobile();
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const hours = ["05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00"];
  
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "list" : "grid");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6)
  });

  const [formData, setFormData] = useState({
    programId: "",
    programName: "",
    date: new Date(),
    startHour: "06",
    startMinute: "00",
    endHour: "07",
    endMinute: "00",
    maxCapacity: 15,
    coachId: "",
    coachName: "",
    checkInSettings: {
      enableLimitedCheckins: false,
      enableReservation: false,
      openCheckInMinutes: 10,
      closeCheckInMinutes: 10,
      closeCheckInWhen: 'after' as 'before' | 'after',
      cancelMinutes: 10,
      enableAutoCancel: false
    }
  });
  
  useEffect(() => {
    fetchWeeklySchedule();
    fetchPrograms();
    fetchCoaches();
  }, [selectedDate, viewMode, dateRange]);

  useEffect(() => {
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

  const fetchWeeklySchedule = async () => {
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
            const startTimeStr = cls.start_time;
            const endTimeStr = cls.end_time;
            
            const startTimeDate = new Date(`${dateStr}T${startTimeStr}`);
            const endTimeDate = new Date(`${dateStr}T${endTimeStr}`);
            
            return {
              id: cls.id,
              date: dateStr,
              start_time: startTimeStr,
              end_time: endTimeStr,
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
              startTime: now,
              endTime: new Date(now.getTime() + 3600000),
              maxCapacity: cls.max_capacity || 15,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              spotsLeft: (cls.max_capacity || 15) - (cls.checkins ? cls.checkins.length : 0),
              isCheckedIn: false,
              program: cls.programs,
              coach: cls.profiles
            };
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
  
  const fetchClassesForDay = async (date: Date): Promise<Class[]> => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      let query = supabase
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
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const transformedClasses = (data || []).map(cls => {
        try {
          const dateStr = cls.date;
          const startTimeStr = cls.start_time;
          const endTimeStr = cls.end_time;
          
          const startTimeDate = new Date(`${dateStr}T${startTimeStr}`);
          const endTimeDate = new Date(`${dateStr}T${endTimeStr}`);
          
          if (!isValid(startTimeDate) || !isValid(endTimeDate)) {
            console.error("Invalid date detected:", { dateStr, startTimeStr, endTimeStr });
            const now = new Date();
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
              startTime: now,
              endTime: new Date(now.getTime() + 3600000),
              maxCapacity: cls.max_capacity,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
              isCheckedIn: false,
              program: cls.programs,
              coach: cls.profiles
            };
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
            attendeeCount: attendeeCount,
            spotsLeft: cls.max_capacity - attendeeCount,
            isCheckedIn: false,
            program: cls.programs,
            coach: cls.profiles
          };
        } catch (error) {
          console.error("Error processing class:", error);
          const now = new Date();
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
            startTime: now,
            endTime: new Date(now.getTime() + 3600000),
            maxCapacity: cls.max_capacity,
            attendeeCount: cls.checkins ? cls.checkins.length : 0,
            spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
            isCheckedIn: false,
            program: cls.programs,
            coach: cls.profiles
          };
        }
      });
      
      return transformedClasses;
    } catch (error) {
      console.error("Error fetching classes for day:", error);
      return [];
    }
  };
  
  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase.from("programs").select("id, name");
      
      if (error) throw error;
      
      setPrograms(data || []);
      
      if ((!formData.programId || formData.programId === "") && data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          programId: data[0].id,
          programName: data[0].name
        }));
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([{ id: "default", name: "CrossFit" }]);
    }
  };
  
  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "coach");
      
      if (error) {
        console.error("Erro ao buscar coaches:", error);
        const { data: allProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, role");
          
        if (profilesError) throw profilesError;
        
        const coachProfiles = allProfiles?.filter(profile => 
          profile.role === "coach"
        ) || [];
        
        setCoaches(coachProfiles);
        return;
      }
      
      setCoaches(data || []);
      
      if ((!formData.coachId || formData.coachId === "") && data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          coachId: data[0].id,
          coachName: data[0].name
        }));
      }
    } catch (error) {
      console.error("Error fetching coaches:", error);
      setCoaches([]);
    }
  };
  
  const handleSaveClass = async () => {
    try {
      setLoading(true);
      
      if (!formData.programId) {
        toast.error("Selecione um programa");
        return;
      }
      
      if (!formData.coachId) {
        toast.error("Selecione um coach");
        return;
      }
      
      const dateStr = format(formData.date, "yyyy-MM-dd");
      
      const startTimeStr = `${formData.startHour}:${formData.startMinute}:00`;
      const endTimeStr = `${formData.endHour}:${formData.endMinute}:00`;
      
      const classDataToSave = {
        date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        max_capacity: formData.maxCapacity,
        program_id: formData.programId,
        coach_id: formData.coachId,
        check_in_settings: formData.checkInSettings
      };
      
      if (selectedClass?.id) {
        const { error } = await supabase
          .from("classes")
          .update(classDataToSave)
          .eq("id", selectedClass.id);
        
        if (error) throw error;
        
        toast.success("Aula atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("classes")
          .insert([classDataToSave]);
        
        if (error) throw error;
        
        toast.success("Aula criada com sucesso!");
      }
      
      fetchWeeklySchedule();
      setShowNewDialog(false);
      setShowEditDialog(false);
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      toast.error("Erro ao salvar a aula");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClass = async () => {
    if (!selectedClass?.id) return;
    
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", selectedClass.id);
      
      if (error) throw error;
      
      toast.success("Aula excluída com sucesso!");
      
      fetchWeeklySchedule();
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Erro ao excluir aula");
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };
  
  const handleProgramChange = (value: string) => {
    const selected = programs.find(p => p.id === value);
    setFormData(prev => ({
      ...prev,
      programId: value,
      programName: selected ? selected.name : prev.programName
    }));
  };
  
  const handleCoachChange = (value: string) => {
    const selected = coaches.find(c => c.id === value);
    setFormData(prev => ({
      ...prev,
      coachId: value,
      coachName: selected ? selected.name : prev.coachName
    }));
  };
  
  const handleTimeChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCapacityChange = (value: string) => {
    const capacity = parseInt(value);
    if (!isNaN(capacity) && capacity > 0) {
      setFormData(prev => ({ ...prev, maxCapacity: capacity }));
    }
  };
  
  const openNewDialog = () => {
    const today = new Date();
    setFormData({
      programId: programs.length > 0 ? programs[0].id : "",
      programName: programs.length > 0 ? programs[0].name : "CrossFit",
      date: today,
      startHour: "06",
      startMinute: "00",
      endHour: "07",
      endMinute: "00",
      maxCapacity: 15,
      coachId: coaches.length > 0 ? coaches[0].id : "",
      coachName: coaches.length > 0 ? coaches[0].name : "",
      checkInSettings: {
        enableLimitedCheckins: false,
        enableReservation: false,
        openCheckInMinutes: 10,
        closeCheckInMinutes: 10,
        closeCheckInWhen: 'after',
        cancelMinutes: 10,
        enableAutoCancel: false
      }
    });
    setSelectedClass(null);
    setShowNewDialog(true);
  };
  
  const openEditDialog = (classData: any) => {
    if (!classData || !classData.startTime) {
      console.error("Invalid class data", classData);
      toast.error("Dados inválidos da aula");
      return;
    }
    
    try {
      const startTime = new Date(classData.startTime);
      const endTime = new Date(classData.endTime || startTime.getTime() + 3600000);
      
      if (!isValid(startTime)) {
        console.error("Invalid date", { startTime });
        toast.error("Data inválida");
        return;
      }
      
      setFormData({
        programId: classData.program?.id || "",
        programName: classData.program?.name || classData.programName || "",
        date: startTime,
        startHour: format(startTime, "HH"),
        startMinute: format(startTime, "mm"),
        endHour: format(endTime, "HH"),
        endMinute: format(endTime, "mm"),
        maxCapacity: classData.maxCapacity || 15,
        coachId: classData.coach?.id || "",
        coachName: classData.coach?.name || classData.coachName || "",
        checkInSettings: classData.check_in_settings || {
          enableLimitedCheckins: false,
          enableReservation: false,
          openCheckInMinutes: 10,
          closeCheckInMinutes: 10,
          closeCheckInWhen: 'after',
          cancelMinutes: 10,
          enableAutoCancel: false
        }
      });
      
      setSelectedClass(classData);
      setShowEditDialog(true);
    } catch (error) {
      console.error("Error parsing class data", error);
      toast.error("Erro ao processar dados da aula");
    }
  };
  
  const getClassDataForDayAndHour = (day: number, hour: string) => {
    return classes.filter(cls => {
      try {
        if (!cls.startTime || !isValid(new Date(cls.startTime))) {
          return false;
        }
        
        const classDate = new Date(cls.startTime);
        const classHour = format(classDate, "HH:mm");
        const dayOfWeek = classDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        return dayOfWeek === day && classHour === hour;
      } catch (error) {
        console.error("Error filtering class", error);
        return false;
      }
    });
  };
  
  const handlePrevWeek = () => {
    const newStart = addDays(dateRange.start, -7);
    const newEnd = addDays(dateRange.end, -7);
    setDateRange({ start: newStart, end: newEnd });
  };
  
  const handleNextWeek = () => {
    const newStart = addDays(dateRange.start, 7);
    const newEnd = addDays(dateRange.end, 7);
    setDateRange({ start: newStart, end: newEnd });
  };
  
  const renderClassCard = (cls: any) => {
    return (
      <div 
        className="p-2 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
        onClick={() => openEditDialog(cls)}
      >
        <div className="font-medium text-blue-800">{cls.programName}</div>
        <div className="text-sm">{cls.coachName}</div>
        <div className="text-xs flex items-center">
          <span className={cls.attendeeCount >= cls.maxCapacity ? "text-red-600" : "text-green-600"}>
            {cls.attendeeCount}/{cls.maxCapacity}
          </span>
          {cls.attendeeCount >= cls.maxCapacity && (
            <AlertCircle className="h-3 w-3 ml-1 text-red-600" />
          )}
        </div>
      </div>
    );
  };
  
  const renderGridView = () => {
    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="flex items-center space-x-2 w-full sm:w-auto mb-2 sm:mb-0">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm sm:text-base">
              <span className="font-medium">
                {format(dateRange.start, "dd MMM.", { locale: ptBR })} - {format(dateRange.end, "dd MMM.", { locale: ptBR })}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              setDateRange({
                start: startOfWeek(new Date(), { weekStartsOn: 0 }),
                end: addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6)
              });
            }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-right">
            Total de {classes.length} classes
          </div>
        </div>
      
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <Table className="border rounded">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px]">Horário</TableHead>
                  {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                    const date = addDays(dateRange.start, dayOffset);
                    return (
                      <TableHead key={dayOffset} className="text-center">
                        <div className="text-blue-600 font-bold">
                          {format(date, "dd/MM", { locale: ptBR })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(date, "EEEE", { locale: ptBR }).toUpperCase()}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hours.map((hour) => (
                  <TableRow key={hour}>
                    <TableCell className="font-medium text-gray-700">{hour}</TableCell>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const classesForCell = getClassDataForDayAndHour(day, hour);
                      return (
                        <TableCell key={day} className="p-1">
                          {classesForCell.length > 0 ? (
                            classesForCell.map((cls, idx) => (
                              <div key={idx} className="mb-1">
                                {renderClassCard(cls)}
                              </div>
                            ))
                          ) : (
                            <div 
                              className="h-16 border border-dashed border-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:bg-gray-50"
                              onClick={() => {
                                const dayDate = addDays(dateRange.start, day);
                                const [hourVal, minuteVal] = hour.split(":");
                                
                                setFormData(prev => ({
                                  ...prev,
                                  date: dayDate,
                                  startHour: hourVal,
                                  startMinute: minuteVal,
                                  endHour: (parseInt(hourVal) + 1).toString().padStart(2, "0"),
                                  endMinute: minuteVal
                                }));
                                
                                setSelectedClass(null);
                                setShowNewDialog(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              <span>Adicionar aula</span>
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    );
  };
  
  const renderListView = () => {
    const classesByDay = classes.reduce((acc: { [key: string]: Class[] }, cls) => {
      try {
        if (!cls.startTime || !isValid(new Date(cls.startTime))) {
          return acc;
        }
        
        const dateStr = format(new Date(cls.startTime), 'yyyy-MM-dd');
        
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        
        acc[dateStr].push(cls);
        return acc;
      } catch (error) {
        console.error("Error grouping class by day:", error);
        return acc;
      }
    }, {});
    
    const sortedDates = Object.keys(classesByDay).sort();
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="flex items-center space-x-2 w-full sm:w-auto mb-2 sm:mb-0">
            <Button variant="outline" size="icon" onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm sm:text-base">
              <span className="font-medium">
                {format(selectedDate, "d MMM yyyy", { locale: ptBR })}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date())}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-500 w-full sm:w-auto text-center sm:text-right">
            Total de {classes.length} classes
          </div>
        </div>

        <div className="space-y-6">
          {sortedDates.map(dateStr => {
            const date = new Date(dateStr);
            const dayClasses = classesByDay[dateStr];
            
            return (
              <div key={dateStr} className="space-y-2">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-blue-600">
                    {format(date, "dd/MM", { locale: ptBR })}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase">
                    {format(date, "EEEE", { locale: ptBR })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {dayClasses.map((cls, index) => {
                    const startTime = new Date(cls.startTime);
                    const endTime = new Date(cls.endTime);
                    
                    return (
                      <div 
                        key={index} 
                        className="border rounded-lg p-3 shadow-sm hover:shadow transition-all cursor-pointer"
                        onClick={() => openEditDialog(cls)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-red-500 font-semibold">
                              {format(startTime, "HH:mm", { locale: ptBR })} - {format(endTime, "HH:mm", { locale: ptBR })}
                            </div>
                            <div className="font-bold uppercase">{cls.programName}</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between mt-2">
                          <div className="text-sm text-gray-600">{cls.coachName}</div>
                          <div className="text-sm font-medium">
                            {cls.attendeeCount}/{cls.maxCapacity} vagas
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {sortedDates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma aula encontrada para esta data.
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderClassDialog = (isNew: boolean) => {
    return (
      <Dialog 
        open={isNew ? showNewDialog : showEditDialog} 
        onOpenChange={isNew ? setShowNewDialog : setShowEditDialog}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Nova Aula" : "Editar Aula"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="program">Programa *</Label>
              <Select
                value={formData.programId}
                onValueChange={(value) => {
                  const selected = programs.find(p => p.id === value);
                  setFormData(prev => ({
                    ...prev,
                    programId: value,
                    programName: selected ? selected.name : prev.programName
                  }));
                }}
              >
                <SelectTrigger id="program">
                  <SelectValue placeholder="Selecione um programa" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time selection fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.startHour}
                    onValueChange={(value) => handleTimeChange("startHour", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                          {hour.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.startMinute}
                    onValueChange={(value) => handleTimeChange("startMinute", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hora Fim</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.endHour}
                    onValueChange={(value) => handleTimeChange("endHour", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                          {hour.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.endMinute}
                    onValueChange={(value) => handleTimeChange("endMinute", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coach">Coach</Label>
              <Select
                value={formData.coachId}
                onValueChange={handleCoachChange}
              >
                <SelectTrigger id="coach">
                  <SelectValue placeholder="Selecione um coach" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade máxima</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => handleCapacityChange(e.target.value)}
              />
            </div>
            
            <CheckInSettings 
              settings={formData.checkInSettings}
              onSettingsChange={(settings) => 
                setFormData(prev => ({ ...prev, checkInSettings: settings }))
              }
            />
          </div>
          
          <DialogFooter className="mt-6 flex gap-2">
            {!isNew && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteClass} 
                disabled={deleteLoading}
                className="mr-auto"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir
                  </>
                )}
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveClass} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={openNewDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Aula
          </Button>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={`mr-2 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={viewMode === "list" ? "bg-gray-100" : ""}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderListView()
      )}
      
      {renderClassDialog(true)}
      {renderClassDialog(false)}
    </div>
  );
};

export default ScheduleTab;
