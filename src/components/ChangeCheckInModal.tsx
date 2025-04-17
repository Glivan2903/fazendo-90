
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
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-amber-100 p-4 mb-6">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
          
          <DialogHeader className="text-center">
            <h3 className="text-2xl font-bold mb-2">Alterar check-in</h3>
            <div className="text-gray-600 mt-2 space-y-2">
              <p className="text-lg">
                Você tem certeza que deseja alterar o check-in?
              </p>
              {conflictTime && (
                <p className="text-base font-medium text-amber-700 bg-amber-50 py-2 px-4 rounded-md">
                  Você já possui check-in em <span className="font-bold">{conflictClassName}</span> às <span className="font-bold">{conflictTime}</span>
                </p>
              )}
              <p className="text-sm mt-2">
                Seu check-in atual será cancelado automaticamente.
              </p>
            </div>
          </DialogHeader>
          
          <DialogFooter className="mt-8 w-full flex justify-between gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1 py-2">
              CANCELAR
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 py-2">
              CONFIRMAR
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeCheckInModal;
