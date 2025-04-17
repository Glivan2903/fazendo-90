
import { useState } from "react";

export interface ClassFormData {
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
}

export const useClassForm = (initialPrograms: any[] = [], initialCoaches: any[] = []) => {
  const [formData, setFormData] = useState<ClassFormData>({
    programId: initialPrograms[0]?.id || "",
    programName: initialPrograms[0]?.name || "",
    date: new Date(),
    startHour: "06",
    startMinute: "00",
    endHour: "07",
    endMinute: "00",
    maxCapacity: 15,
    coachId: initialCoaches[0]?.id || "",
    coachName: initialCoaches[0]?.name || ""
  });

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };

  const handleProgramChange = (value: string, programs: any[]) => {
    const selected = programs.find(p => p.id === value);
    setFormData(prev => ({
      ...prev,
      programId: value,
      programName: selected ? selected.name : prev.programName
    }));
  };

  const handleCoachChange = (value: string, coaches: any[]) => {
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

  const resetForm = (programs: any[] = [], coaches: any[] = []) => {
    setFormData({
      programId: programs[0]?.id || "",
      programName: programs[0]?.name || "",
      date: new Date(),
      startHour: "06",
      startMinute: "00",
      endHour: "07",
      endMinute: "00",
      maxCapacity: 15,
      coachId: coaches[0]?.id || "",
      coachName: coaches[0]?.name || ""
    });
  };

  return {
    formData,
    setFormData,
    handleDateChange,
    handleProgramChange,
    handleCoachChange,
    handleTimeChange,
    handleCapacityChange,
    resetForm
  };
};
