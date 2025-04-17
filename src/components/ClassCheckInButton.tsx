
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarX, LogIn, RefreshCw } from "lucide-react";

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
          className="w-full py-6 text-base font-medium flex items-center justify-center gap-2"
          onClick={onCancelCheckIn}
          disabled={processing}
        >
          {processing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Cancelando...
            </>
          ) : (
            <>
              <CalendarX className="h-5 w-5" />
              Cancelar Check-in
            </>
          )}
        </Button>
      ) : hasConflict ? (
        <Button
          className="w-full py-6 text-base font-medium bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2"
          disabled={processing}
          onClick={onChangeCheckIn}
        >
          {processing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5" />
              Alterar Check-in
            </>
          )}
        </Button>
      ) : (
        <Button
          className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={!canCheckIn || processing}
          onClick={onCheckIn}
        >
          {processing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Confirmar Check-in
            </>
          )}
        </Button>
      )}

      {!canCheckIn && !isCheckedIn && !hasConflict && (
        <p className="text-center text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          Esta aula está lotada
        </p>
      )}
    </div>
  );
};

export default ClassCheckInButton;
