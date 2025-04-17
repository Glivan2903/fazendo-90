
import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Check } from "lucide-react";

interface ClassCheckInButtonProps {
  isCheckedIn: boolean;
  canCheckIn: boolean;
  processing: boolean;
  onCheckIn: () => void;
  onCancelCheckIn: () => void;
  showChangeDialog: boolean;
  onCloseDialog: () => void;
  onConfirmChange: () => void;
}

const ClassCheckInButton: React.FC<ClassCheckInButtonProps> = ({
  isCheckedIn,
  canCheckIn,
  processing,
  onCheckIn,
  onCancelCheckIn,
  showChangeDialog,
  onCloseDialog,
  onConfirmChange,
}) => {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        {isCheckedIn ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-md text-green-700 mb-2">
              <Check className="h-5 w-5" />
              <span>Check-in confirmado para esta aula</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full py-6 text-base border-gray-300"
              onClick={onCancelCheckIn}
              disabled={processing}
            >
              {processing ? "Cancelando..." : "Cancelar Check-in"}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full py-6 text-base bg-blue-600 hover:bg-blue-700"
            disabled={!canCheckIn || processing}
            onClick={onCheckIn}
          >
            {processing ? "Confirmando..." : "Confirmar Check-in"}
          </Button>
        )}
      </div>

      <AlertDialog open={showChangeDialog} onOpenChange={onCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <AlertDialogTitle className="text-center">Alterar check-in</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Você já está inscrito em outra aula neste dia. Deseja cancelar o check-in anterior e confirmar para esta aula?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <AlertDialogCancel onClick={onCloseDialog} className="sm:w-32">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmChange} className="sm:w-32 bg-blue-600 hover:bg-blue-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!canCheckIn && !isCheckedIn && (
        <p className="text-center text-red-500 text-sm mt-2">
          Esta aula está lotada.
        </p>
      )}
    </>
  );
};

export default ClassCheckInButton;
