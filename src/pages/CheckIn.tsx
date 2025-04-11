
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CalendarSelector from "../components/CalendarSelector";
import ClassItem from "../components/ClassItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { Class } from "../types";
import { fetchClasses } from "../api/classApi";

const CheckIn = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getClasses = async () => {
      setLoading(true);
      try {
        const fetchedClasses = await fetchClasses(selectedDate);
        setClasses(fetchedClasses);
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

  const handleClassClick = (classId: string) => {
    navigate(`/class/${classId}`);
  };

  const dayLabel = format(selectedDate, "d 'de' MMMM", { locale: ptBR });

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold">Check-in</h1>
        <p className="text-gray-600 mt-1">{dayLabel}</p>
      </header>

      <CalendarSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner />
        ) : classes.length > 0 ? (
          classes.map((cls) => (
            <ClassItem
              key={cls.id}
              classData={cls}
              onClick={() => handleClassClick(cls.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Não há aulas disponíveis neste dia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
