
import React from "react";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CheckInSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const CheckInSuccessModal: React.FC<CheckInSuccessModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <DialogHeader className="text-center">
            <h3 className="text-xl font-bold">Sucesso!</h3>
            <p className="text-gray-600">Check-in realizado com sucesso.</p>
          </DialogHeader>
          
          <DialogFooter className="mt-6 w-full flex justify-center">
            <Button onClick={onClose} className="w-full sm:w-auto">
              OK
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInSuccessModal;
