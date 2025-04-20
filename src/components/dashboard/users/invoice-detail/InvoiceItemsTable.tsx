
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface InvoiceItem {
  description: string;
  period_start: string | null;
  period_end: string | null;
  total: number;
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

export const InvoiceItemsTable = ({ items }: InvoiceItemsTableProps) => {
  if (!items?.length) return null;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
        <Tag className="h-4 w-4 mr-2" /> DETALHES DO PLANO
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Período</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                {item.period_start && item.period_end ? 
                  `${formatDate(item.period_start)} - ${formatDate(item.period_end)}` : 
                  '-'
                }
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
