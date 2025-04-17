
import React, { useState } from "react";
import { Payment } from "@/types";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "./PaymentDialog";

interface PaymentsListProps {
  payments: Payment[];
  loading: boolean;
  onUpdate: () => void;
}

const PaymentStatusBadge = ({ status }: { status: Payment["status"] }) => {
  const getStatusColor = () => {
    switch (status) {
      case "pago":
        return "bg-green-500";
      case "pendente":
        return "bg-yellow-500";
      case "atrasado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return <Badge className={getStatusColor()}>{status}</Badge>;
};

const PaymentsList: React.FC<PaymentsListProps> = ({ payments, loading, onUpdate }) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  if (loading) {
    return <div>Carregando...</div>;
  }

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.profiles?.name}</TableCell>
                <TableCell>R$ {payment.valor.toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(payment.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell>{payment.metodo_pagamento || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPayment(payment)}
                  >
                    Gerenciar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <PaymentDialog
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default PaymentsList;
