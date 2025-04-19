
export type Transaction = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  payment_method?: string;
  bank_account?: string;
  transaction_type: 'income' | 'expense';
  fornecedor?: string | null;
  buyer_name?: string;
};

export interface NewIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formValues: {
    date: Date;
    buyer_name: string;
    user_id: string;
    description: string;
    category: string;
    amount: string;
    status: string;
    payment_method: string;
    bank_account: string;
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  users: any[];
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  categories?: string[];
}
