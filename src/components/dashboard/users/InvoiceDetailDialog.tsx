
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tag, Receipt, CreditCard } from 'lucide-react';

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

const InvoiceDetailDialog: React.FC<InvoiceDetailDialogProps> = ({ 
  open, 
  onOpenChange, 
  invoice 
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-blue-600 text-white p-4 -m-6 mb-6">
          <DialogTitle className="text-xl flex items-center">
            <Tag className="mr-2" /> Fatura #{invoice.invoice_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
              <Tag className="h-4 w-4 mr-2" /> FATURA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{invoice.buyer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de vencimento</p>
                <p>{formatDate(invoice.due_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor total</p>
                <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Desconto</p>
                <p>{formatCurrency(invoice.discount_amount || 0)}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
              <Receipt className="h-4 w-4 mr-2" /> DETALHES DA FATURA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p>{invoice.category || 'Não especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fornecedor</p>
                <p>{invoice.fornecedor || 'Não especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de emissão</p>
                <p>{formatDate(invoice.sale_date) || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de transação</p>
                <p>{invoice.transaction_type || 'Não especificado'}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm uppercase font-semibold mb-2 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" /> PAGAMENTO
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Forma de pagamento</p>
                <p>{invoice.payment_method || 'Não especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data do pagamento</p>
                <p>{formatDate(invoice.payment_date) || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>{invoice.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conta bancária</p>
                <p>{invoice.bank_account || 'Não especificado'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailDialog;
