
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceBasicInfo } from './InvoiceBasicInfo';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { InvoiceDetails } from './InvoiceDetails';
import { InvoicePaymentInfo } from './InvoicePaymentInfo';

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any; // Type this properly based on your data structure
}

export const InvoiceDetailDialog: React.FC<InvoiceDetailDialogProps> = ({
  open,
  onOpenChange,
  invoice
}) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
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
