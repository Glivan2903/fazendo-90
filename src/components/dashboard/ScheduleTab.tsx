import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSchedule } from "@/hooks/useSchedule";
import GridView from "./schedule/GridView";
import ListView from "./schedule/ListView";
import ClassDialog from "./schedule/ClassDialog";

interface ScheduleTabProps {
  classes: any[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ classes: initialClasses }) => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "list" : "grid");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const {
    classes,
    dateRange,
    setDateRange,
    fetchWeeklySchedule,
  } = useSchedule(initialClasses);

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
    fetchWeeklySchedule(viewMode);
    fetchPrograms();
    fetchCoaches();
  }, [selectedDate, viewMode, dateRange]);

  useEffect(() => {
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

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
        coach_id: formData.coachId
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
      
      fetchWeeklySchedule(viewMode);
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
      
      fetchWeeklySchedule(viewMode);
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Erro ao excluir aula");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openNewClass = (date: Date, hour: string) => {
    const [hourVal, minuteVal] = hour.split(":");
    setFormData(prev => ({
      ...prev,
      date,
      startHour: hourVal,
      startMinute: minuteVal,
      endHour: (parseInt(hourVal) + 1).toString().padStart(2, "0"),
      endMinute: minuteVal
    }));
    setSelectedClass(null);
    setShowNewDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={() => {
              setFormData(prev => ({ ...prev, date: new Date() }));
              setSelectedClass(null);
              setShowNewDialog(true);
            }}
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
      
      {viewMode === "grid" ? (
        <GridView
          classes={classes}
          dateRange={dateRange}
          onPrevWeek={() => setDateRange({
            start: addDays(dateRange.start, -7),
            end: addDays(dateRange.end, -7)
          })}
          onNextWeek={() => setDateRange({
            start: addDays(dateRange.start, 7),
            end: addDays(dateRange.end, 7)
          })}
          onResetWeek={() => setDateRange({
            start: startOfWeek(new Date(), { weekStartsOn: 0 }),
            end: addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6)
          })}
          onEditClass={(classData) => {
            setSelectedClass(classData);
            setShowEditDialog(true);
          }}
          onNewClass={openNewClass}
        />
      ) : (
        <ListView
          classes={classes}
          selectedDate={selectedDate}
          onPrevDay={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
          onNextDay={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
          onToday={() => setSelectedDate(new Date())}
          onEditClass={(classData) => {
            setSelectedClass(classData);
            setShowEditDialog(true);
          }}
        />
      )}

      <ClassDialog
        isNew={!selectedClass}
        showDialog={showNewDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            selectedClass ? setShowEditDialog(false) : setShowNewDialog(false);
          }
        }}
        formData={formData}
        onFormChange={handleFormChange}
        programs={programs}
        coaches={coaches}
        loading={loading}
        deleteLoading={deleteLoading}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
      />
    </div>
  );
};

export default ScheduleTab;
