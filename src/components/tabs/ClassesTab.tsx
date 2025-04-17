
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CalendarSelector from "../CalendarSelector";
import ClassItem from "../ClassItem";
import LoadingSpinner from "../LoadingSpinner";
import { Class } from "@/types";
import { fetchClasses } from "@/api/classApi";

interface ClassesTabProps {
  onClassClick: (classId: string) => void;
}

const ClassesTab: React.FC<ClassesTabProps> = ({ onClassClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getClasses = async () => {
      setLoading(true);
      try {
        const fetchedClasses = await fetchClasses(selectedDate);
        // Filter out any classes that might not be in the schedule
        const validClasses = fetchedClasses.filter(cls => 
          cls.startTime && cls.endTime && 
          !isNaN(cls.startTime.getTime()) && 
          !isNaN(cls.endTime.getTime())
        );
        setClasses(validClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getClasses();
  }, [selectedDate]);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const dayLabel = format(selectedDate, "d 'de' MMMM", {
    locale: ptBR
  });
  
  return (
    <>
      <h1 className="text-2xl font-bold text-center">Check-in</h1>
      <p className="text-center text-gray-600 mt-1 mb-4">{dayLabel}</p>
      
      <CalendarSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
      
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner />
        ) : classes.length > 0 ? (
          classes.map(cls => (
            <ClassItem key={cls.id} classData={cls} onClick={() => onClassClick(cls.id)} />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Não há aulas disponíveis neste dia.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ClassesTab;
