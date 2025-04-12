
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Loader2, Trash, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ClassDetail } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ClassEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassDetail | null;
  isNew: boolean;
  onSave: (classData: any) => Promise<void>;
  onDelete?: (classId: string) => Promise<void>;
}

const ClassEditDialog: React.FC<ClassEditDialogProps> = ({ 
  isOpen, 
  onClose, 
  classData,
  isNew,
  onSave,
  onDelete
}) => {
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
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [programs, setPrograms] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    if (classData && !isNew) {
      const startTime = new Date(classData.startTime);
      const endTime = new Date(classData.endTime);
      
      setFormData({
        programId: classData.program.id,
        programName: classData.program.name,
        date: startTime,
        startHour: format(startTime, "HH"),
        startMinute: format(startTime, "mm"),
        endHour: format(endTime, "HH"),
        endMinute: format(endTime, "mm"),
        maxCapacity: classData.maxCapacity,
        coachId: classData.coach.id,
        coachName: classData.coach.name
      });
      
      setDate(startTime);
    } else {
      // Default values for new class
      const today = new Date();
      setFormData({
        programId: "",
        programName: "CrossFit",
        date: today,
        startHour: "06",
        startMinute: "00",
        endHour: "07",
        endMinute: "00",
        maxCapacity: 15,
        coachId: "",
        coachName: ""
      });
      
      setDate(today);
    }
    
    fetchPrograms();
    fetchCoaches();
  }, [classData, isNew, isOpen]);
  
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
      // Use default values if fetch fails
      setPrograms([{ id: "default", name: "CrossFit" }]);
    }
  };
  
  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "coach");
      
      if (error) throw error;
      
      setCoaches(data || []);
      
      // If no coach is selected but we have coaches, select the first one
      if ((!formData.coachId || formData.coachId === "") && data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          coachId: data[0].id,
          coachName: data[0].name
        }));
      }
    } catch (error) {
      console.error("Error fetching coaches:", error);
      // Use default values if fetch fails
      setCoaches([{ id: "default", name: "Coach" }]);
    }
  };
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create date objects for start and end times
      const dateStr = format(formData.date, "yyyy-MM-dd");
      const startTime = new Date(`${dateStr}T${formData.startHour}:${formData.startMinute}:00`);
      const endTime = new Date(`${dateStr}T${formData.endHour}:${formData.endMinute}:00`);
      
      // Validate times
      if (endTime <= startTime) {
        toast.error("O horário de término deve ser após o horário de início");
        return;
      }
      
      const classDataToSave = {
        id: classData?.id,
        date: dateStr,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        max_capacity: formData.maxCapacity,
        program_id: formData.programId || null,
        coach_id: formData.coachId || null
      };
      
      await onSave(classDataToSave);
      onClose();
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Erro ao salvar a aula");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!classData?.id || !onDelete) return;
    
    try {
      setDeleteLoading(true);
      await onDelete(classData.id);
      onClose();
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Erro ao excluir a aula");
    } finally {
      setDeleteLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nova Classe" : "Editar Classe"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
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
            <Label htmlFor="capacity" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Capacidade máxima
            </Label>
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
                {coaches.map(coach => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              
              {!isNew && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassEditDialog;
