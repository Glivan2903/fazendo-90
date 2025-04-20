
import React from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface SalesDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: {
    id: string;
    buyer_name: string;
    sale_date: string;
    seller_name: string;
    amount: number;
    discount_amount: number;
    total_amount: number;
    items: Array<{
      type: string;
      description: string;
      period_start: string;
      period_end: string;
      quantity: number;
      unit_price: number;
      discount: number;
      total: number;
    }>;
    payment: {
      method: string;
      due_date: string;
      amount: number;
      discount: number;
      fee: number;
      total: number;
      status: string;
    };
  };
}

const SalesDetailDialog: React.FC<SalesDetailDialogProps> = ({
  open,
  onOpenChange,
  sale
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 -m-6 mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Tag className="mr-2" /> Venda {sale.id}
          </h2>
        </div>

        <div className="space-y-6">
          {/* VENDA Section */}
          <div className="border border-dashed rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center uppercase">
              <Tag className="h-4 w-4 mr-2" /> VENDA
            </h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Comprador</TableCell>
                  <TableCell>
                    <a href="#" className="text-blue-600 hover:underline">
                      {sale.buyer_name}
                    </a>
                  </TableCell>
                  <TableCell className="font-medium">Data</TableCell>
                  <TableCell>{formatDate(sale.sale_date)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Vendedor</TableCell>
                  <TableCell>{sale.seller_name}</TableCell>
                  <TableCell className="font-medium">Valor unitário</TableCell>
                  <TableCell>{formatCurrency(sale.amount)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Descontos</TableCell>
                  <TableCell>{formatCurrency(sale.discount_amount)}</TableCell>
                  <TableCell className="font-medium">Valor total</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(sale.total_amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* ITEM(S) DE VENDA Section */}
          <div className="border border-dashed rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center uppercase">
              <Tag className="h-4 w-4 mr-2" /> ITEM(S) DE VENDA
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Desc. item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          Período: {formatDate(item.period_start)} - {formatDate(item.period_end)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* PAGAMENTO Section */}
          <div className="border border-dashed rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center uppercase">
              <Tag className="h-4 w-4 mr-2" /> PAGAMENTO
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forma</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Desc. parcela</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{sale.payment.method}</TableCell>
                  <TableCell>{formatDate(sale.payment.due_date)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.payment.amount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.payment.discount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.payment.fee)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.payment.total)}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {sale.payment.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button className="bg-green-600 hover:bg-green-700">
            <Edit className="mr-2 h-4 w-4" /> Editar venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesDetailDialog;
