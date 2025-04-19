
import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Save, Trash, Loader2, Calendar as CalendarIcon } from "lucide-react";
import CheckInSettings from "../CheckInSettings";

interface ClassDialogProps {
  isNew: boolean;
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  onFormChange: (field: string, value: any) => void;
  programs: any[];
  coaches: any[];
  loading: boolean;
  deleteLoading: boolean;
  onSave: () => void;
  onDelete: () => void;
}

const ClassDialog: React.FC<ClassDialogProps> = ({
  isNew,
  showDialog,
  onOpenChange,
  formData,
  onFormChange,
  programs,
  coaches,
  loading,
  deleteLoading,
  onSave,
  onDelete
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
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
                onFormChange("program", { id: value, name: selected?.name });
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
                  onSelect={(date) => onFormChange("date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora Início</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.startHour}
                  onValueChange={(value) => onFormChange("startHour", value)}
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
                  onValueChange={(value) => onFormChange("startMinute", value)}
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
                  onValueChange={(value) => onFormChange("endHour", value)}
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
                  onValueChange={(value) => onFormChange("endMinute", value)}
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
              onValueChange={(value) => {
                const selected = coaches.find(c => c.id === value);
                onFormChange("coach", { id: value, name: selected?.name });
              }}
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
              onChange={(e) => onFormChange("maxCapacity", parseInt(e.target.value))}
            />
          </div>
          
          <CheckInSettings 
            settings={formData.checkInSettings}
            onSettingsChange={(settings) => onFormChange("checkInSettings", settings)}
          />
        </div>
        
        <DialogFooter className="mt-6 flex gap-2">
          {!isNew && (
            <Button 
              variant="destructive" 
              onClick={onDelete} 
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
            onClick={onSave} 
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

export default ClassDialog;
