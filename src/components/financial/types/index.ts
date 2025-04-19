export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  payment_method?: string;
  fornecedor?: string;
  bank_account?: string;
  transaction_type: 'income' | 'expense';
  buyer_name: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface NewIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formValues: {
    date: Date;
    category: string;
    description: string;
    amount: string;
    status: string;
    payment_method: string;
    fornecedor: string;
    user_id: string;
    bank_account: string;
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  users: Array<{ id: string; name: string; email: string }>;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
}

export interface NewExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formValues: {
    date: Date;
    category: string;
    description: string;
    amount: string;
    status: string;
    payment_method: string;
    fornecedor: string;
    user_id: string;
    bank_account: string;
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  suppliers: Supplier[];
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  fetchSuppliers: () => void;
}
