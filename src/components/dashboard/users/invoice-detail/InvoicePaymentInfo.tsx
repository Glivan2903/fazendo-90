
import React from 'react';
import { CreditCard } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface InvoicePaymentInfoProps {
  paymentMethod: string | null;
  paymentDate: string | null;
  status: string;
  bankAccount: string | null;
}

export const InvoicePaymentInfo = ({
  paymentMethod,
  paymentDate,
  status,
  bankAccount
}: InvoicePaymentInfoProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
        <CreditCard className="h-4 w-4 mr-2" /> PAGAMENTO
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Forma de pagamento</p>
          <p>{paymentMethod || 'Não especificado'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Data do pagamento</p>
          <p>{formatDate(paymentDate) || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p>{status}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Conta bancária</p>
          <p>{bankAccount || 'Não especificado'}</p>
        </div>
      </div>
    </div>
  );
};
