
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import AttendeeList from "../components/AttendeeList";
import { ClassDetail as ClassDetailType, Attendee } from "../types";
import { fetchClassDetails, checkInToClass, cancelCheckIn } from "../api/classApi";
import { toast } from "sonner";
import ClassHeader from "../components/ClassHeader";
import ClassCoachInfo from "../components/ClassCoachInfo";
import ClassCapacityInfo from "../components/ClassCapacityInfo";
import ClassCheckInButton from "../components/ClassCheckInButton";

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

  const isFull = classData.attendeeCount >= classData.maxCapacity;
  const canCheckIn = !isFull || isCheckedIn;

  return (
    <div className="max-w-md mx-auto px-4 pb-10">
      <ClassHeader classData={classData} />

      <div className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
        <ClassCoachInfo classData={classData} />
        <ClassCapacityInfo classData={classData} />
      </div>

      <ClassCheckInButton
        isCheckedIn={isCheckedIn}
        canCheckIn={canCheckIn}
        processing={processing}
        onCheckIn={handleCheckIn}
        onCancelCheckIn={handleCancelCheckIn}
      />

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
