import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkInToClass, cancelCheckIn, fetchClassDetails } from "../../api/classApi";
import { ClassDetail, Attendee } from "../../types";
import { toast } from "sonner";

export const useClassDetail = (classId: string | undefined) => {
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [previousClassId, setPreviousClassId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!classId) return;

      setLoading(true);
      try {
        console.log("Fetching details for class:", classId);
        const { classDetail: details, attendees: attendeesList } = await fetchClassDetails(classId);
        console.log("Class details received:", details);
        console.log("Attendees received:", attendeesList);
        
        setClassDetail(details);
        setAttendees(attendeesList);
        
        if (user) {
          const isUserCheckedIn = attendeesList.some(
            (attendee) => attendee.id === user.id
          );
          console.log("Is user checked in:", isUserCheckedIn, "User ID:", user.id);
          setIsCheckedIn(isUserCheckedIn);
        }
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast.error("Erro ao carregar detalhes da aula");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [classId, user]);

  const handleCheckIn = async () => {
    if (!classId || !classDetail) return;

    setProcessing(true);
    try {
      const result = await checkInToClass(classId);
      
      if (result === true) {
        setIsCheckedIn(true);
        const { classDetail: details, attendees: attendeesList } = await fetchClassDetails(classId);
        setClassDetail(details);
        setAttendees(attendeesList);
        toast.success("Check-in realizado com sucesso!");
      } 
      else if (typeof result === 'string') {
        setPreviousClassId(result);
        setShowChangeDialog(true);
      }
      else {
        toast.error("Não foi possível realizar o check-in");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Erro ao realizar check-in");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelCheckIn = async () => {
    if (!classId) return;
    
    setProcessing(true);
    try {
      const success = await cancelCheckIn(classId);
      if (success) {
        setIsCheckedIn(false);
        const { classDetail: details, attendees: attendeesList } = await fetchClassDetails(classId);
        setClassDetail(details);
        setAttendees(attendeesList);
        toast.success("Check-in cancelado com sucesso");
      }
    } catch (error) {
      console.error("Error canceling check-in:", error);
      toast.error("Erro ao cancelar check-in");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!classId || !previousClassId) return;

    setProcessing(true);
    try {
      await cancelCheckIn(previousClassId);
      
      const success = await checkInToClass(classId);
      
      if (success) {
        setIsCheckedIn(true);
        setShowChangeDialog(false);
        setPreviousClassId(null);
        
        const { classDetail: details, attendees: attendeesList } = await fetchClassDetails(classId);
        setClassDetail(details);
        setAttendees(attendeesList);
        
        toast.success("Check-in alterado com sucesso!");
      } else {
        toast.error("Não foi possível alterar o check-in");
      }
    } catch (error) {
      console.error("Error changing check-in:", error);
      toast.error("Erro ao alterar check-in");
    } finally {
      setProcessing(false);
      setShowChangeDialog(false);
    }
  };

  return {
    classDetail,
    attendees,
    loading,
    processing,
    isCheckedIn,
    showChangeDialog,
    setShowChangeDialog,
    handleCheckIn,
    handleCancelCheckIn,
    handleConfirmChange,
  };
};
