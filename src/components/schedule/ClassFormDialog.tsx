
import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ClassFormDialogProps {
  isNew: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  loading: boolean;
  deleteLoading: boolean;
  formData: {
    programId: string;
    programName: string;
    date: Date;
    startHour: string;
    startMinute: string;
    endHour: string;
    endMinute: string;
    maxCapacity: number;
    coachId: string;
    coachName: string;
  };
  programs: any[];
  coaches: any[];
  onSave: () => void;
  onDelete: () => void;
  onDateChange: (date: Date | undefined) => void;
  onProgramChange: (value: string) => void;
  onCoachChange: (value: string) => void;
  onTimeChange: (field: string, value: string) => void;
  onCapacityChange: (value: string) => void;
}

const ClassFormDialog: React.FC<ClassFormDialogProps> = ({
  isNew,
  isOpen,
  setIsOpen,
  loading,
  deleteLoading,
  formData,
  programs,
  coaches,
  onSave,
  onDelete,
  onDateChange,
  onProgramChange,
  onCoachChange,
  onTimeChange,
  onCapacityChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nova Aula" : "Editar Aula"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program">Programa *</Label>
            <Select
              value={formData.programId}
              onValueChange={onProgramChange}
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
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="center">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={onDateChange}
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
                  onValueChange={(value) => onTimeChange("startHour", value)}
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
                  onValueChange={(value) => onTimeChange("startMinute", value)}
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
                  onValueChange={(value) => onTimeChange("endHour", value)}
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
                  onValueChange={(value) => onTimeChange("endMinute", value)}
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
              onChange={(e) => onCapacityChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coach">Coach</Label>
            <Select
              value={formData.coachId}
              onValueChange={onCoachChange}
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
                onClick={onDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </Button>
            )}
          </div>
          
          <Button 
            onClick={onSave}
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

export default ClassFormDialog;
