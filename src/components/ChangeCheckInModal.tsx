
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChangeCheckInModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conflictClassName?: string;
  conflictTime?: string;
}

const ChangeCheckInModal: React.FC<ChangeCheckInModalProps> = ({
  open,
  onClose,
  onConfirm,
  conflictClassName = "outra aula",
  conflictTime,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="rounded-full bg-yellow-100 p-3 mb-4">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
          
          <DialogHeader className="text-center">
            <h3 className="text-xl font-bold">Alterar check-in</h3>
            <p className="text-gray-600 mt-2">
              Você tem certeza que deseja alterar o check-in? 
              {conflictTime && (
                <span className="block mt-1 text-sm font-medium">
                  Você já possui check-in em {conflictClassName} às {conflictTime}
                </span>
              )}
            </p>
          </DialogHeader>
          
          <DialogFooter className="mt-6 w-full flex justify-between gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              CANCELAR
            </Button>
            <Button onClick={onConfirm} className="flex-1">
              CONFIRMAR
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeCheckInModal;
