
import React from 'react';
import { Tag } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface InvoiceBasicInfoProps {
  buyerName: string;
  dueDate: string;
  totalAmount: number;
  discountAmount: number;
}

export const InvoiceBasicInfo = ({ 
  buyerName, 
  dueDate, 
  totalAmount, 
  discountAmount 
}: InvoiceBasicInfoProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
        <Tag className="h-4 w-4 mr-2" /> FATURA
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Cliente</p>
          <p className="font-medium">{buyerName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Data de vencimento</p>
          <p>{formatDate(dueDate)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Valor total</p>
          <p className="font-semibold">{formatCurrency(totalAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Desconto</p>
          <p>{formatCurrency(discountAmount || 0)}</p>
        </div>
      </div>
    </div>
  );
};
