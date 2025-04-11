
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Avatar from "../components/Avatar";
import LoadingSpinner from "../components/LoadingSpinner";
import AttendeeList from "../components/AttendeeList";
import CapacityBar from "../components/CapacityBar";
import { ClassDetail as ClassDetailType, Attendee } from "../types";
import { fetchClassDetails, checkInToClass, cancelCheckIn } from "../api/classApi";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassDetailType | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getClassDetails = async () => {
      if (!classId) return;
      
      setLoading(true);
      try {
        const { classDetail, attendees } = await fetchClassDetails(classId);
        setClassData(classDetail);
        setAttendees(attendees);
        
        // Randomly set check-in status for demo
        setIsCheckedIn(Math.random() > 0.5);
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast.error("Erro ao carregar a aula");
      } finally {
        setLoading(false);
      }
    };

    getClassDetails();
  }, [classId]);

  const handleCheckIn = async () => {
    if (!classId || !classData) return;
    
    setProcessing(true);
    try {
      const success = await checkInToClass(classId);
      if (success) {
        setIsCheckedIn(true);
        toast.success("Check-in realizado com sucesso!");
        
        // Add the user to attendees (in a real app, this would come from the backend)
        const newAttendee: Attendee = {
          id: "currentUser",
          name: "Você",
        };
        setAttendees([...attendees, newAttendee]);
        setClassData({
          ...classData,
          attendeeCount: classData.attendeeCount + 1
        });
      }
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Erro ao realizar check-in");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelCheckIn = async () => {
    if (!classId || !classData) return;
    
    setProcessing(true);
    try {
      const success = await cancelCheckIn(classId);
      if (success) {
        setIsCheckedIn(false);
        toast.success("Check-in cancelado");
        
        // Remove the current user from attendees
        setAttendees(attendees.filter(a => a.id !== "currentUser"));
        setClassData({
          ...classData,
          attendeeCount: Math.max(0, classData.attendeeCount - 1)
        });
      }
    } catch (error) {
      console.error("Error canceling check-in:", error);
      toast.error("Erro ao cancelar check-in");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p>Aula não encontrada</p>
        <button
          className="mt-4 text-blue-500"
          onClick={() => navigate("/check-in")}
        >
          Voltar para aulas
        </button>
      </div>
    );
  }

  const formattedDate = format(classData.startTime, "d 'de' MMMM", {
    locale: ptBR,
  });
  const startTimeFormatted = format(classData.startTime, "HH:mm");
  const endTimeFormatted = format(classData.endTime, "HH:mm");
  const isFull = classData.attendeeCount >= classData.maxCapacity;
  const canCheckIn = !isFull || isCheckedIn;

  return (
    <div className="max-w-md mx-auto px-4 pb-10">
      <header className="py-4">
        <button
          className="flex items-center text-blue-500 mb-4"
          onClick={() => navigate("/check-in")}
        >
          <ArrowLeft size={18} className="mr-1" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold">{classData.program.name}</h1>
        <div className="flex items-center gap-1 text-gray-600 mt-1">
          <Clock size={16} />
          <span>{formattedDate} • {startTimeFormatted} - {endTimeFormatted}</span>
        </div>
      </header>

      <div className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Professor</h2>
          <div className="flex items-center gap-3">
            <Avatar
              url={classData.coach.avatarUrl}
              name={classData.coach.name}
              size={40}
            />
            <span className="font-medium">{classData.coach.name}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-500">Capacidade</h2>
            <div className="flex items-center">
              <Users size={16} className="mr-1 text-gray-500" />
              <span className="text-sm text-gray-700">
                {classData.attendeeCount}/{classData.maxCapacity}
              </span>
            </div>
          </div>
          <CapacityBar
            current={classData.attendeeCount}
            total={classData.maxCapacity}
          />
        </div>
      </div>

      <div className="mb-8">
        {isCheckedIn ? (
          <Button 
            variant="outline" 
            className="w-full py-6 text-base"
            onClick={handleCancelCheckIn}
            disabled={processing}
          >
            {processing ? "Cancelando..." : "Cancelar Check-in"}
          </Button>
        ) : (
          <Button
            className="w-full py-6 text-base"
            disabled={!canCheckIn || processing}
            onClick={handleCheckIn}
          >
            {processing ? "Confirmando..." : "Confirmar Check-in"}
          </Button>
        )}

        {!canCheckIn && !isCheckedIn && (
          <p className="text-center text-red-500 text-sm mt-2">
            Esta aula está lotada.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Alunos confirmados ({classData.attendeeCount})
        </h2>
        <AttendeeList attendees={attendees} />
      </div>
    </div>
  );
};

export default ClassDetail;
