
import React from 'react';
import { Receipt } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface InvoiceDetailsProps {
  category: string | null;
  fornecedor: string | null;
  saleDate: string;
  plan: string | null;
  transactionType: string | null;
}

export const InvoiceDetails = ({
  category,
  fornecedor,
  saleDate,
  plan,
  transactionType
}: InvoiceDetailsProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
        <Receipt className="h-4 w-4 mr-2" /> DETALHES DA FATURA
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Categoria</p>
          <p>{category || 'Não especificado'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Fornecedor</p>
          <p>{fornecedor || 'Não especificado'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Data de emissão</p>
          <p>{formatDate(saleDate) || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Plano</p>
          <p>{plan || 'Não especificado'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tipo de transação</p>
          <p>{transactionType || 'Não especificado'}</p>
        </div>
      </div>
    </div>
  );
};
