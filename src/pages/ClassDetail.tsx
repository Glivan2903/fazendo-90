import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { checkInToClass, cancelCheckIn, fetchClassDetails } from "../api/classApi";
import ClassHeader from "../components/ClassHeader";
import ClassCoachInfo from "../components/ClassCoachInfo";
import ClassCapacityInfo from "../components/ClassCapacityInfo";
import ClassCheckInButton from "../components/ClassCheckInButton";
import AttendeeList from "../components/AttendeeList";
import LoadingSpinner from "../components/LoadingSpinner";
import { ClassDetail as ClassDetailType, Attendee } from "../types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState<ClassDetailType | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const { user, userRole, signOut } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!classId) return;

      setLoading(true);
      try {
        const { classDetail: details, attendees: attendeesList } = await fetchClassDetails(classId);
        setClassDetail(details);
        setAttendees(attendeesList);
        
        if (user) {
          const isUserCheckedIn = attendeesList.some(
            (attendee) => attendee.id === user.id
          );
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

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCheckIn = async () => {
    if (!classId) return;

    setProcessing(true);
    try {
      const success = await checkInToClass(classId);
      if (success) {
        setIsCheckedIn(true);
        const { classDetail: details, attendees: attendeesList } = await fetchClassDetails(classId);
        setClassDetail(details);
        setAttendees(attendeesList);
      } else {
        setShowChangeDialog(true);
      }
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Erro ao realizar check-in");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!classId) return;

    setProcessing(true);
    try {
      await cancelCheckIn(classId);
      const success = await checkInToClass(classId);
      if (success) {
        setIsCheckedIn(true);
        setShowChangeDialog(false);
        const { classDetail: details, attendees: attendeesList } = await fetchClassDetails(classId);
        setClassDetail(details);
        setAttendees(attendeesList);
      }
    } catch (error) {
      console.error("Error changing check-in:", error);
      toast.error("Erro ao alterar check-in");
    } finally {
      setProcessing(false);
    }
  };

  const canCheckIn = classDetail ? classDetail.attendeeCount < classDetail.maxCapacity : false;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Aula não encontrada</h2>
        <Button variant="link" onClick={handleGoBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <header className="py-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-2xl font-bold flex-1 text-center">Detalhes da Aula</h1>
        
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

      <div>
        <ClassHeader classData={classDetail} className="mb-6" />

        <ClassCoachInfo classData={classDetail} />

        <ClassCapacityInfo classData={classDetail} className="mb-6" />

        <ClassCheckInButton
          isCheckedIn={isCheckedIn}
          canCheckIn={canCheckIn}
          processing={processing}
          onCheckIn={handleCheckIn}
          onCancelCheckIn={handleCancelCheckIn}
          showChangeDialog={showChangeDialog}
          onCloseDialog={() => setShowChangeDialog(false)}
          onConfirmChange={handleConfirmChange}
        />

        <AttendeeList attendees={attendees} />
      </div>
    </div>
  );
};

export default ClassDetail;
