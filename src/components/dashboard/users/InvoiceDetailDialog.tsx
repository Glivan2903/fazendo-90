
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceHeader } from './invoice-detail/InvoiceHeader';
import { InvoiceBasicInfo } from './invoice-detail/InvoiceBasicInfo';
import { InvoiceItemsTable } from './invoice-detail/InvoiceItemsTable';
import { InvoiceDetails } from './invoice-detail/InvoiceDetails';
import { InvoicePaymentInfo } from './invoice-detail/InvoicePaymentInfo';

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
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <InvoiceHeader invoiceNumber={invoice.invoice_number} />

        <div className="space-y-6">
          <InvoiceBasicInfo
            buyerName={invoice.buyer_name}
            dueDate={invoice.due_date}
            totalAmount={invoice.total_amount}
            discountAmount={invoice.discount_amount}
          />

          <InvoiceItemsTable items={invoice.bank_invoice_items} />

          <InvoiceDetails
            category={invoice.category}
            fornecedor={invoice.fornecedor}
            saleDate={invoice.sale_date}
            plan={invoice.plan}
            transactionType={invoice.transaction_type}
          />

          <InvoicePaymentInfo
            paymentMethod={invoice.payment_method}
            paymentDate={invoice.payment_date}
            status={invoice.status}
            bankAccount={invoice.bank_account}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailDialog;
