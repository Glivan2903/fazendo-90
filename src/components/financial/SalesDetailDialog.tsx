
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Save, X, Tag, Receipt, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SalesDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesData: any;
}

const SalesDetailDialog: React.FC<SalesDetailDialogProps> = ({ 
  open, 
  onOpenChange, 
  salesData 
}) => {
  const [formData, setFormData] = useState({
    status: salesData?.status || 'pending',
    payment_method: salesData?.payment_method || '',
    notes: salesData?.notes || ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">RECEBIDO</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">PENDENTE</Badge>;
      case 'overdue':
        return <Badge variant="destructive">VENCIDO</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800">CANCELADO</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: formData.status,
          payment_method: formData.payment_method,
          payment_date: formData.status === 'paid' ? new Date().toISOString() : null,
          notes: formData.notes
        })
        .eq('id', salesData.id);

      if (error) throw error;

      // If there's a bank invoice ID, update that as well
      if (salesData.bank_invoice_id) {
        const { error: invoiceError } = await supabase
          .from('bank_invoices')
          .update({
            status: formData.status,
            payment_method: formData.payment_method,
            payment_date: formData.status === 'paid' ? new Date().toISOString() : null
          })
          .eq('id', salesData.bank_invoice_id);

        if (invoiceError) throw invoiceError;
      }

      toast.success('Venda atualizada com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast.error('Erro ao atualizar venda');
    }
  };

  // Get invoice number from bank_invoice if available, otherwise use a formatted ID
  const invoiceNumber = salesData.bank_invoice?.invoice_number || 
                        (salesData.reference ? salesData.reference : salesData.id.substring(0, 8));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-blue-600 text-white p-4 -m-6 mb-6">
          <DialogTitle className="text-xl flex items-center">
            <Tag className="mr-2" /> Venda {invoiceNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {salesData.bank_invoice && (
            <>
              <div className="border rounded-lg p-4">
                <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" /> VENDA
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Comprador</Label>
                    <p className="text-sm font-medium">{salesData.bank_invoice.buyer_name}</p>
                  </div>
                  <div>
                    <Label>Data</Label>
                    <p className="text-sm">{formatDate(salesData.bank_invoice.sale_date)}</p>
                  </div>
                  <div>
                    <Label>Valor unitário</Label>
                    <p className="text-sm">{formatCurrency(salesData.amount)}</p>
                  </div>
                  <div>
                    <Label>Descontos</Label>
                    <p className="text-sm">{formatCurrency(salesData.bank_invoice.discount_amount || 0)}</p>
                  </div>
                  <div>
                    <Label>Valor total</Label>
                    <p className="text-sm font-semibold">{formatCurrency(salesData.bank_invoice.total_amount)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Vendedor</Label>
                  <p className="text-sm">{salesData.bank_invoice.seller_name}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
                  <Receipt className="h-4 w-4 mr-2" /> ITEM(S) DE VENDA
                </h3>
                <div className="mt-2 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-24">Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Desc. Item</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesData.bank_invoice.bank_invoice_items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-100">
                              {item.item_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.period_start && item.period_end && (
                                <p className="text-xs text-gray-500">
                                  Período: {formatDate(item.period_start)} - {formatDate(item.period_end)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.discount || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          <div className="border rounded-lg p-4">
            <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" /> PAGAMENTO
            </h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Desc. parcela</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>
                    <Select 
                      value={formData.payment_method || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="bank_transfer">Transferência</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{formatDate(salesData.due_date)}</TableCell>
                  <TableCell>{formatCurrency(salesData.amount)}</TableCell>
                  <TableCell>{formatCurrency(0)}</TableCell>
                  <TableCell>{formatCurrency(0)}</TableCell>
                  <TableCell>{formatCurrency(salesData.amount)}</TableCell>
                  <TableCell>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Vencido</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter className="mt-6 space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" /> Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesDetailDialog;
