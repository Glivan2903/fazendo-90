
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CalendarSelector from "../components/CalendarSelector";
import ClassItem from "../components/ClassItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { Class } from "../types";
import { fetchClasses } from "../api/classApi";
import { useAuth } from "@/contexts/AuthContext";

const CheckIn = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

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
      <header className="py-6 flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">Check-in</h1>
          <p className="text-gray-600 mt-1">{dayLabel}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/check-in")}
            >
              Check-in
            </DropdownMenuItem>
            
            {(userRole === "admin" || userRole === "coach") && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/teacher-dashboard")}
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/schedule-editor")}
                >
                  Editor de Grade
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuItem
              className="cursor-pointer text-red-500"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
