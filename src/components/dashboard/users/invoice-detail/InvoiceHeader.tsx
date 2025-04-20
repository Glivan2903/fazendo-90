
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tag } from 'lucide-react';

interface InvoiceHeaderProps {
  invoiceNumber: string;
}

export const InvoiceHeader = ({ invoiceNumber }: InvoiceHeaderProps) => {
  return (
    <DialogHeader className="bg-blue-600 text-white p-4 -m-6 mb-6">
      <DialogTitle className="text-xl flex items-center">
        <Tag className="mr-2" /> Fatura #{invoiceNumber}
      </DialogTitle>
    </DialogHeader>
  );
};
