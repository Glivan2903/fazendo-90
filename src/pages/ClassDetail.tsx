
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ClassDetailHeader from "../components/class-detail/ClassDetailHeader";
import ClassHeader from "../components/ClassHeader";
import ClassCoachInfo from "../components/ClassCoachInfo";
import ClassCapacityInfo from "../components/ClassCapacityInfo";
import ClassCheckInButton from "../components/ClassCheckInButton";
import AttendeeList from "../components/AttendeeList";
import LoadingSpinner from "../components/LoadingSpinner";
import { useClassDetail } from "../components/class-detail/useClassDetail";

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const {
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

  const canCheckIn = classDetail ? classDetail.attendeeCount < classDetail.maxCapacity : false;

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <ClassDetailHeader />
      
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
