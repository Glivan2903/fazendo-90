
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useClassDetail } from "../components/class-detail/useClassDetail";
import CapacityBar from "@/components/CapacityBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import ClassCheckInButton from "@/components/ClassCheckInButton";

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const {
    classDetail,
    attendees,
    loading,
    processing,
    isCheckedIn,
    isClassTimeExpired,
    showChangeDialog,
    setShowChangeDialog,
    handleCheckIn,
    handleCancelCheckIn,
    handleConfirmChange,
  } = useClassDetail(classId);

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
        <Button variant="link" onClick={() => navigate(-1)} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const formattedDate = format(classDetail.startTime, "d 'de' MMMM", {
    locale: ptBR,
  });
  
  const startTime = format(classDetail.startTime, "HH:mm");
  const endTime = format(classDetail.endTime, "HH:mm");

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary my-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Voltar
      </button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{classDetail.program.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formattedDate} • {startTime} - {endTime}</span>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Professor</h2>
          <Link 
            to={`/profile/${classDetail.coach.id}`}
            className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg transition-colors"
          >
            <Avatar>
              <AvatarImage src={classDetail.coach.avatarUrl} />
              <AvatarFallback>{classDetail.coach.name[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{classDetail.coach.name}</span>
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Capacidade</span>
            <span>{classDetail.attendeeCount}/{classDetail.maxCapacity}</span>
          </div>
          <CapacityBar
            current={classDetail.attendeeCount}
            total={classDetail.maxCapacity}
          />
        </div>

        <div className="space-y-2">
          {attendees.map((attendee) => (
            <Link
              key={attendee.id}
              to={`/profile/${attendee.id}`}
              className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg transition-colors"
            >
              <Avatar>
                <AvatarImage src={attendee.avatarUrl} />
                <AvatarFallback>{attendee.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{attendee.name}</span>
            </Link>
          ))}
        </div>

        <ClassCheckInButton
          isCheckedIn={isCheckedIn}
          canCheckIn={classDetail.attendeeCount < classDetail.maxCapacity}
          processing={processing}
          isClassTimeExpired={isClassTimeExpired}
          onCheckIn={handleCheckIn}
          onCancelCheckIn={handleCancelCheckIn}
          showChangeDialog={showChangeDialog}
          onCloseDialog={() => setShowChangeDialog(false)}
          onConfirmChange={handleConfirmChange}
        />
      </div>
    </div>
  );
};

export default ClassDetail;
