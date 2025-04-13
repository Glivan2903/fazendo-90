
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
import { AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Plus, Save, Trash, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ScheduleTabProps {
  classes: Class[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ classes: initialClasses }) => {
  const isMobile = useIsMobile();
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const hours = ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00"];
  
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);

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
  }, [selectedDate, viewMode]);

  const fetchWeeklySchedule = async () => {
    try {
      setLoading(true);
      
      let allClasses: Class[] = [];
      const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        const fetchedClasses = await fetchClassesForDay(date);
        allClasses = [...allClasses, ...fetchedClasses];
      }
      
      setClasses(allClasses);
    } catch (error) {
      console.error("Error fetching weekly schedule:", error);
      toast.error("Erro ao carregar grade horária");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClassesForDay = async (date: Date) => {
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
          checkins (id)
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
            const now = new Date();
            return {
              id: cls.id,
              programName: cls.programs?.name || "CrossFit",
              coachName: cls.profiles?.name || "Coach",
              startTime: now,
              endTime: new Date(now.getTime() + 3600000),
              maxCapacity: cls.max_capacity,
              attendeeCount: cls.checkins ? cls.checkins.length : 0,
              program: cls.programs,
              coach: cls.profiles,
              date: dateStr
            };
          }
          
          return {
            id: cls.id,
            programName: cls.programs?.name || "CrossFit",
            coachName: cls.profiles?.name || "Coach",
            startTime: startTimeDate,
            endTime: endTimeDate,
            maxCapacity: cls.max_capacity,
            attendeeCount: cls.checkins ? cls.checkins.length : 0,
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
    if (!classData || !classData.startTime || !classData.endTime) {
      console.error("Invalid class data", classData);
      toast.error("Dados inválidos da aula");
      return;
    }
    
    try {
      const startTime = new Date(classData.startTime);
      const endTime = new Date(classData.endTime);
      
      if (!isValid(startTime) || !isValid(endTime)) {
        console.error("Invalid dates", { startTime, endTime });
        toast.error("Datas inválidas");
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
        maxCapacity: classData.maxCapacity,
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
        const dayOfWeek = (classDate.getDay() + 6) % 7;
        return dayOfWeek === day && classHour === hour;
      } catch (error) {
        console.error("Error filtering class", error);
        return false;
      }
    });
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
  
  const renderMobileView = () => {
    return (
      <div className="space-y-4">
        {days.map((day, dayIndex) => (
          <Card key={dayIndex} className="mb-4">
            <CardHeader className="py-2">
              <CardTitle className="text-base">{day}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {hours.map((hour) => {
                  const classesForCell = getClassDataForDayAndHour(dayIndex, hour);
                  if (classesForCell.length === 0) return null;
                  
                  return (
                    <div key={hour} className="p-3">
                      <h3 className="text-sm font-medium text-gray-500">{hour}</h3>
                      {classesForCell.map((cls, idx) => (
                        <div key={idx} className="mt-1">
                          {renderClassCard(cls)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderDesktopView = () => {
    return (
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Horário</TableHead>
                {days.slice(0, 5).map((day, index) => (
                  <TableHead key={index}>{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hours.map((hour) => (
                <TableRow key={hour}>
                  <TableCell className="font-medium">{hour}</TableCell>
                  {days.slice(0, 5).map((_, dayIndex) => {
                    const classesForCell = getClassDataForDayAndHour(dayIndex, hour);
                    return (
                      <TableCell key={dayIndex} className="p-2">
                        {classesForCell.length > 0 ? (
                          classesForCell.map((cls, idx) => (
                            <div key={idx} className="mb-2 last:mb-0">
                              {renderClassCard(cls)}
                            </div>
                          ))
                        ) : (
                          <div 
                            className="h-16 border border-dashed border-gray-200 rounded-md flex items-center justify-center text-sm text-gray-400 cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              // Pre-fill the form with the selected day and time
                              const today = new Date();
                              const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
                              const dayDate = addDays(weekStart, dayIndex);
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
                            <Plus className="h-4 w-4 mr-1" />
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
                onValueChange={handleProgramChange}
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
                    onSelect={handleDateChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
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
                    onValueChange={(value) => handleTimeChange("startHour", value)}
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
                    onValueChange={(value) => handleTimeChange("startMinute", value)}
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
                    onValueChange={(value) => handleTimeChange("endHour", value)}
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
                    onValueChange={(value) => handleTimeChange("endMinute", value)}
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
                onChange={(e) => handleCapacityChange(e.target.value)}
              />
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
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Grade Horária Semanal</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            isMobile ? renderMobileView() : renderDesktopView()
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
