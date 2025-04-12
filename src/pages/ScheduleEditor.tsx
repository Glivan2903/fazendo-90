
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Edit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ClassEditDialog from "@/components/ClassEditDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ScheduleEditor = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (userRole !== "admin" && userRole !== "coach") {
      toast.error("Você não tem permissão para acessar esta página");
      navigate("/check-in");
    }
  }, [user, userRole, navigate]);
  
  useEffect(() => {
    fetchClasses();
  }, [selectedDate, viewMode]);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      
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
        `);
      
      if (viewMode === "day") {
        query = query.eq("date", format(selectedDate, "yyyy-MM-dd"));
      } else if (viewMode === "week") {
        const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
        const dates = [];
        
        for (let i = 0; i < 7; i++) {
          dates.push(format(addDays(startDate, i), "yyyy-MM-dd"));
        }
        
        query = query.in("date", dates);
      }
      
      query = query.order("start_time", { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our needs
      const transformedClasses = (data || []).map(cls => ({
        id: cls.id,
        startTime: cls.start_time,
        endTime: cls.end_time,
        date: cls.date,
        maxCapacity: cls.max_capacity,
        program: cls.programs,
        coach: cls.profiles,
        attendeeCount: cls.checkins ? cls.checkins.length : 0
      }));
      
      setClasses(transformedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Erro ao carregar aulas");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveClass = async (classData: any) => {
    try {
      if (classData.id) {
        // Update existing class
        const { error } = await supabase
          .from("classes")
          .update({
            date: classData.date,
            start_time: classData.start_time,
            end_time: classData.end_time,
            max_capacity: classData.max_capacity,
            program_id: classData.program_id,
            coach_id: classData.coach_id
          })
          .eq("id", classData.id);
        
        if (error) throw error;
        
        toast.success("Aula atualizada com sucesso!");
      } else {
        // Create new class
        const { error } = await supabase
          .from("classes")
          .insert([{
            date: classData.date,
            start_time: classData.start_time,
            end_time: classData.end_time,
            max_capacity: classData.max_capacity,
            program_id: classData.program_id,
            coach_id: classData.coach_id
          }]);
        
        if (error) throw error;
        
        toast.success("Aula criada com sucesso!");
      }
      
      // Refresh classes
      fetchClasses();
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Erro ao salvar aula");
      throw error;
    }
  };
  
  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId);
      
      if (error) throw error;
      
      toast.success("Aula excluída com sucesso!");
      
      // Refresh classes
      fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Erro ao excluir aula");
      throw error;
    }
  };
  
  const openEditDialog = (classData: any) => {
    setSelectedClass({
      id: classData.id,
      startTime: classData.startTime,
      endTime: classData.endTime,
      program: classData.program,
      coach: classData.coach,
      maxCapacity: classData.maxCapacity,
      attendeeCount: classData.attendeeCount
    });
    setShowEditDialog(true);
  };
  
  const renderTimeSlot = (hour: number, minute: number) => {
    const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    
    // Find classes that start at this time
    const classesAtTime = classes.filter(cls => {
      const startTime = new Date(cls.startTime);
      return startTime.getHours() === hour && startTime.getMinutes() === minute;
    });
    
    return (
      <div key={timeString} className="mb-2">
        <div className="text-sm font-medium text-gray-500">{timeString}</div>
        {classesAtTime.length > 0 ? (
          classesAtTime.map(cls => (
            <div 
              key={cls.id} 
              className="p-2 bg-blue-50 border border-blue-200 rounded-md my-1 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => openEditDialog(cls)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{cls.program?.name || "Sem programa"}</div>
                <Button size="icon" variant="ghost" onClick={(e) => {
                  e.stopPropagation();
                  openEditDialog(cls);
                }}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {format(new Date(cls.startTime), "HH:mm")} - {format(new Date(cls.endTime), "HH:mm")}
              </div>
              <div className="text-sm text-gray-600">
                Coach: {cls.coach?.name || "Não atribuído"}
              </div>
              <div className="text-sm flex items-center">
                <span className={cls.attendeeCount >= cls.maxCapacity ? "text-red-600" : "text-green-600"}>
                  {cls.attendeeCount} / {cls.maxCapacity} alunos
                </span>
                {cls.attendeeCount >= cls.maxCapacity && (
                  <AlertCircle className="h-3 w-3 ml-1 text-red-600" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-2 border border-dashed border-gray-200 rounded-md my-1 text-sm text-gray-400 text-center">
            Sem aulas
          </div>
        )}
      </div>
    );
  };
  
  const renderDayView = () => {
    const timeSlots = [];
    
    // Morning slots
    for (let hour = 5; hour < 12; hour++) {
      for (let minute of [0]) {
        timeSlots.push(renderTimeSlot(hour, minute));
      }
    }
    
    // Afternoon and evening slots
    for (let hour = 16; hour < 22; hour++) {
      for (let minute of [0]) {
        timeSlots.push(renderTimeSlot(hour, minute));
      }
    }
    
    return (
      <div className="space-y-2">
        {timeSlots}
      </div>
    );
  };
  
  const renderWeekView = () => {
    const days = [];
    const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dayClasses = classes.filter(cls => cls.date === format(date, "yyyy-MM-dd"));
      
      days.push(
        <div key={i} className="min-w-[250px] max-w-[250px]">
          <div className="sticky top-0 bg-white py-2 border-b font-medium">
            {format(date, "EEE, d MMM", { locale: ptBR })}
          </div>
          <div className="space-y-2 p-2">
            {dayClasses.length > 0 ? (
              dayClasses.map(cls => (
                <div 
                  key={cls.id} 
                  className="p-2 bg-blue-50 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => openEditDialog(cls)}
                >
                  <div className="font-medium">{cls.program?.name || "Sem programa"}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(cls.startTime), "HH:mm")} - {format(new Date(cls.endTime), "HH:mm")}
                  </div>
                  <div className="text-sm text-gray-600">
                    Coach: {cls.coach?.name || "Não atribuído"}
                  </div>
                  <div className="text-sm">
                    <span className={cls.attendeeCount >= cls.maxCapacity ? "text-red-600" : "text-green-600"}>
                      {cls.attendeeCount} / {cls.maxCapacity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 border border-dashed border-gray-200 rounded-md text-sm text-gray-400 text-center">
                Sem aulas
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="overflow-auto">
        <div className="flex space-x-2 min-w-[1200px]">
          {days}
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Editor de Grade Horária</h1>
        <p className="text-gray-600">Adicione e edite aulas do CrossBox</p>
      </header>
      
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[240px]",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week")}>
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="ml-auto">
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "day" 
              ? `Aulas de ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}` 
              : `Semana de ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "dd/MM")} a ${format(addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6), "dd/MM")}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {viewMode === "day" && renderDayView()}
              {viewMode === "week" && renderWeekView()}
            </>
          )}
        </CardContent>
      </Card>
      
      {showNewDialog && (
        <ClassEditDialog
          isOpen={showNewDialog}
          onClose={() => setShowNewDialog(false)}
          classData={null}
          isNew={true}
          onSave={handleSaveClass}
        />
      )}
      
      {showEditDialog && selectedClass && (
        <ClassEditDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          classData={selectedClass}
          isNew={false}
          onSave={handleSaveClass}
          onDelete={handleDeleteClass}
        />
      )}
    </div>
  );
};

export default ScheduleEditor;
