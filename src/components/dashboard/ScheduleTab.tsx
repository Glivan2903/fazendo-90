
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  // Form data state
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
    coachName: ""
  });
  
  useEffect(() => {
    fetchWeeklySchedule();
    fetchPrograms();
    fetchCoaches();
  }, [selectedDate, viewMode, dateRange]);

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
        // For list view, fetch all recurring classes
        const { data, error } = await supabase
          .from("classes")
          .select(`
            id,
            date,
            start_time,
            end_time,
            max_capacity,
            programs (id, name),
            profiles!coach_id (id, name, avatar_url),
            checkins (id)
          `)
          .order('start_time', { ascending: true });
          
        if (error) throw error;
        
        // Transform to Class objects
        allClasses = (data || []).map(cls => {
          try {
            const dateStr = cls.date;
            const startTimeStr = cls.start_time;
            const endTimeStr = cls.end_time;
            
            // Create valid date objects
            const startTimeDate = new Date(`${dateStr}T${startTimeStr}`);
            const endTimeDate = new Date(`${dateStr}T${endTimeStr}`);
            
            return {
              id: cls.id,
              programName: cls.programs?.name || "CrossFit",
              coachName: cls.profiles?.name || "Coach",
              startTime: startTimeDate,
              endTime: endTimeDate,
              maxCapacity: cls.max_capacity,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
              isCheckedIn: false,
              program: cls.programs,
              coach: cls.profiles,
              date: dateStr
            };
          } catch (error) {
            console.error("Error processing class:", error);
            const now = new Date();
            return {
              id: cls.id,
              programName: cls.programs?.name || "CrossFit",
              coachName: cls.profiles?.name || "Coach",
              startTime: now,
              endTime: new Date(now.getTime() + 3600000),
              maxCapacity: cls.max_capacity || 15,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              spotsLeft: (cls.max_capacity || 15) - (cls.checkins ? cls.checkins.length : 0),
              isCheckedIn: false,
              program: cls.programs,
              coach: cls.profiles,
              date: cls.date
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
          programs (id, name),
          profiles!coach_id (id, name, avatar_url),
          checkins (id, user_id)
        `)
        .eq("date", formattedDate);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data
      const transformedClasses = (data || []).map(cls => {
        try {
          const dateStr = cls.date;
          const startTimeStr = cls.start_time;
          const endTimeStr = cls.end_time;
          
          // Create valid date objects
          const startTimeDate = new Date(`${dateStr}T${startTimeStr}`);
          const endTimeDate = new Date(`${dateStr}T${endTimeStr}`);
          
          if (!isValid(startTimeDate) || !isValid(endTimeDate)) {
            console.error("Invalid date detected:", { dateStr, startTimeStr, endTimeStr });
            const now = new Date();
            return {
              id: cls.id,
              programName: cls.programs?.name || "CrossFit",
              coachName: cls.profiles?.name || "Coach",
              startTime: now,
              endTime: new Date(now.getTime() + 3600000),
              maxCapacity: cls.max_capacity,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
              isCheckedIn: false,
              program: cls.programs,
              coach: cls.profiles,
              date: dateStr
            };
          }
          
          const attendeeCount = cls.checkins ? cls.checkins.length : 0;
          
          return {
            id: cls.id,
            programName: cls.programs?.name || "CrossFit",
            coachName: cls.profiles?.name || "Coach",
            startTime: startTimeDate,
            endTime: endTimeDate,
            maxCapacity: cls.max_capacity,
            attendeeCount: attendeeCount,
            spotsLeft: cls.max_capacity - attendeeCount,
            isCheckedIn: false,
            program: cls.programs,
            coach: cls.profiles,
            date: dateStr
          };
        } catch (error) {
          console.error("Error processing class:", error);
          const now = new Date();
          return {
            id: cls.id,
            programName: cls.programs?.name || "CrossFit",
            coachName: cls.profiles?.name || "Coach",
            startTime: now,
            endTime: new Date(now.getTime() + 3600000),
            maxCapacity: cls.max_capacity,
            attendeeCount: cls.checkins ? cls.checkins.length : 0,
            spotsLeft: cls.max_capacity - (cls.checkins ? cls.checkins.length : 0),
            isCheckedIn: false,
            program: cls.programs,
            coach: cls.profiles,
            date: cls.date
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
      
      // If no program is selected but we have programs, select the first one
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
      
      // Format date as YYYY-MM-DD
      const dateStr = format(formData.date, "yyyy-MM-dd");
      
      // Create time strings
      const startTimeStr = `${formData.startHour}:${formData.startMinute}:00`;
      const endTimeStr = `${formData.endHour}:${formData.endMinute}:00`;
      
      const classDataToSave = {
        date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        max_capacity: formData.maxCapacity,
        program_id: formData.programId,
        coach_id: formData.coachId
      };
      
      if (selectedClass?.id) {
        // Update existing class
        const { error } = await supabase
          .from("classes")
          .update(classDataToSave)
          .eq("id", selectedClass.id);
        
        if (error) throw error;
        
        toast.success("Aula atualizada com sucesso!");
      } else {
        // Create new class
        const { error } = await supabase
          .from("classes")
          .insert([classDataToSave]);
        
        if (error) throw error;
        
        toast.success("Aula criada com sucesso!");
      }
      
      // Refresh classes
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
      
      // Refresh classes
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
      coachName: coaches.length > 0 ? coaches[0].name : ""
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
        coachName: classData.coach?.name || classData.coachName || ""
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <span className="font-medium">
                {format(dateRange.start, "dd MMM. yyyy", { locale: ptBR })} - {format(dateRange.end, "dd MMM. yyyy", { locale: ptBR })}
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
          <div className="text-sm text-gray-500">
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
    // Group classes by time slot
    const groupedClasses = classes.reduce((acc: Record<string, Class[]>, cls) => {
      try {
        if (!cls.startTime || !isValid(new Date(cls.startTime))) {
          return acc;
        }
        
        const startTime = new Date(cls.startTime);
        const endTime = new Date(cls.endTime);
        
        const timeSlot = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;
        
        if (!acc[timeSlot]) {
          acc[timeSlot] = [];
        }
        
        acc[timeSlot].push(cls);
        return acc;
      } catch (error) {
        console.error("Error grouping class:", error);
        return acc;
      }
    }, {});
    
    // Sort time slots
    const sortedTimeSlots = Object.keys(groupedClasses).sort();
    
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horário</TableHead>
              <TableHead>Programa</TableHead>
              <TableHead>Data de início</TableHead>
              <TableHead>Data de término</TableHead>
              <TableHead>Dias da semana</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTimeSlots.map(timeSlot => (
              <TableRow key={timeSlot}>
                <TableCell className="font-medium">{timeSlot}</TableCell>
                <TableCell>{groupedClasses[timeSlot][0].programName}</TableCell>
                <TableCell>{format(new Date(groupedClasses[timeSlot][0].startTime), "dd/MM/yyyy")}</TableCell>
                <TableCell>Não definido</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                      <div 
                        key={index}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                        ${index % 2 === 0 ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditDialog(groupedClasses[timeSlot][0])}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sortedTimeSlots.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhuma aula encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Dialog for adding/editing a class
  const renderClassDialog = (isNew: boolean) => {
    return (
      <Dialog 
        open={isNew ? showNewDialog : showEditDialog} 
        onOpenChange={isNew ? setShowNewDialog : setShowEditDialog}
      >
        <DialogContent className="sm:max-w-md">
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
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário de início *</Label>
                <div className="flex space-x-2">
                  <Select
                    value={formData.startHour}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, startHour: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select
                    value={formData.startMinute}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, startMinute: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Horário de término *</Label>
                <div className="flex space-x-2">
                  <Select
                    value={formData.endHour}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, endHour: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select
                    value={formData.endMinute}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, endMinute: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade máxima</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => {
                  const capacity = parseInt(e.target.value);
                  if (!isNaN(capacity) && capacity > 0) {
                    setFormData(prev => ({ ...prev, maxCapacity: capacity }));
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coach">Coach</Label>
              <Select
                value={formData.coachId}
                onValueChange={(value) => {
                  const selected = coaches.find(c => c.id === value);
                  setFormData(prev => ({
                    ...prev,
                    coachId: value,
                    coachName: selected ? selected.name : prev.coachName
                  }));
                }}
              >
                <SelectTrigger id="coach">
                  <SelectValue placeholder="Selecione um coach" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.length > 0 ? (
                    coaches.map(coach => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-coach" disabled>
                      Nenhum coach disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              
              {!isNew && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteClass}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Excluindo..." : "Excluir"}
                </Button>
              )}
            </div>
            
            <Button 
              onClick={handleSaveClass}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Grade Horária</CardTitle>
          <div className="flex space-x-2">
            <div className="border rounded-md flex overflow-hidden">
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grade
              </Button>
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
            
            <Button variant="default" onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            viewMode === "grid" ? renderGridView() : renderListView()
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Class Dialog */}
      {renderClassDialog(true)}
      {renderClassDialog(false)}
    </div>
  );
};

export default ScheduleTab;
