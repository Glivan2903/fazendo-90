
import React from "react";
import { Button } from "@/components/ui/button";

interface ClassCheckInButtonProps {
  isCheckedIn: boolean;
  canCheckIn: boolean;
  processing: boolean;
  hasConflict: boolean;
  onCheckIn: () => void;
  onCancelCheckIn: () => void;
  onChangeCheckIn: () => void;
}

const ClassCheckInButton: React.FC<ClassCheckInButtonProps> = ({
  isCheckedIn,
  canCheckIn,
  processing,
  hasConflict,
  onCheckIn,
  onCancelCheckIn,
  onChangeCheckIn,
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
      ) : hasConflict ? (
        <Button
          className="w-full py-6 text-base"
          disabled={processing}
          onClick={onChangeCheckIn}
        >
          {processing ? "Processando..." : "Alterar Check-in"}
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

      {!canCheckIn && !isCheckedIn && !hasConflict && (
        <p className="text-center text-red-500 text-sm mt-2">
          Esta aula está lotada.
        </p>
      )}
    </div>
  );
};

export default ClassCheckInButton;
