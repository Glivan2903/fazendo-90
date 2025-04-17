
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
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-green-100 p-4 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <DialogHeader className="text-center">
            <h3 className="text-2xl font-bold mb-2">Sucesso!</h3>
            <p className="text-gray-600 text-lg">Check-in realizado com sucesso.</p>
          </DialogHeader>
          
          <DialogFooter className="mt-8 w-full flex justify-center">
            <Button 
              onClick={onClose} 
              className="w-full sm:w-auto px-8 py-2 text-base bg-blue-600 hover:bg-blue-700"
            >
              OK
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInSuccessModal;
