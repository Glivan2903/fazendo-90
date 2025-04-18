
export interface BankInvoiceTable {
  id: string;
  buyer_name: string;
  created_at?: string;
  discount_amount: number;
  due_date: string;
  invoice_number: string;
  payment_date?: string | null;
  payment_method?: string | null;
  sale_date: string;
  seller_name: string;
  status: string;
  total_amount: number;
  updated_at?: string | null;
  user_id: string;
  category?: string;
  fornecedor?: string;
  bank_account?: string;
  transaction_type?: 'income' | 'expense';
}
