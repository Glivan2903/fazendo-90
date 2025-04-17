
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Payment } from "@/types";
import { format } from "date-fns";
import { updatePayment } from "@/api/financialApi";
import { toast } from "sonner";

// Define payment method type for proper type checking
type PaymentMethod = "dinheiro" | "cartao" | "pix" | "transferencia";
type PaymentStatus = "pendente" | "pago" | "atrasado";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onUpdate: () => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  payment,
  onUpdate,
}) => {
  const [status, setStatus] = useState<PaymentStatus>(payment?.status || "pendente");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(
    payment?.metodo_pagamento as PaymentMethod || undefined
  );
  const [loading, setLoading] = useState(false);

  if (!payment) return null;

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      await updatePayment(payment.id, {
        status,
        metodo_pagamento: paymentMethod,
        data_pagamento: status === "pago" ? new Date().toISOString() : null,
      });
      toast.success("Pagamento atualizado com sucesso!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Erro ao atualizar pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Aluno</Label>
            <p className="text-sm font-medium">{payment.profiles?.name}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Valor</Label>
            <p className="text-sm font-medium">R$ {payment.valor.toFixed(2)}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Vencimento</Label>
            <p className="text-sm font-medium">
              {format(new Date(payment.data_vencimento), "dd/MM/yyyy")}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={status} 
              onValueChange={(value: PaymentStatus) => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <Select 
              value={paymentMethod || ""} 
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpdatePayment} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
