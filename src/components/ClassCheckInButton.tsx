
import React from "react";
import { Button } from "@/components/ui/button";

interface ClassCheckInButtonProps {
  isCheckedIn: boolean;
  canCheckIn: boolean;
  processing: boolean;
  onCheckIn: () => void;
  onCancelCheckIn: () => void;
}

const ClassCheckInButton: React.FC<ClassCheckInButtonProps> = ({
  isCheckedIn,
  canCheckIn,
  processing,
  onCheckIn,
  onCancelCheckIn,
}) => {
  return (
    <div className="mb-8">
      {isCheckedIn ? (
        <Button 
          variant="outline" 
          className="w-full py-6 text-base"
          onClick={onCancelCheckIn}
          disabled={processing}
        >
          {processing ? "Cancelando..." : "Cancelar Check-in"}
        </Button>
      ) : (
        <Button
          className="w-full py-6 text-base"
          disabled={!canCheckIn || processing}
          onClick={onCheckIn}
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
  );
};

export default ClassCheckInButton;
