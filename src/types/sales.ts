
export interface Sale {
  id: string;
  sale_code: string;
  sale_date: string;
  seller_name: string;
  total_amount: number;
  discount_amount: number;
  total: number;
  status: string;
  created_at: string;
  user_id: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  total: number;
  plan_id?: string;
  period_start?: string;
  period_end?: string;
  is_renewal: boolean;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_method: string;
  amount: number;
  due_date: string;
  status: string;
  payment_date?: string;
}
