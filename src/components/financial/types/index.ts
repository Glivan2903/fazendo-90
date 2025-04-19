
export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  payment_method: string;
  fornecedor: string | null;
  bank_account: string;
  transaction_type: 'income' | 'expense';
  buyer_name?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
