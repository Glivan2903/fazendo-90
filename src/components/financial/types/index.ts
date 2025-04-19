
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

export interface NewExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formValues: {
    date: Date;
    fornecedor: string;
    description: string;
    category: string;
    amount: string | number;
    status: string;
    payment_method: string;
    bank_account: string;
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  suppliers: Supplier[];
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  fetchSuppliers: () => void;
}

export interface NewIncomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formValues: {
    date: Date;
    buyer_name: string;
    description: string;
    category: string;
    amount: string | number;
    status: string;
    payment_method: string;
    bank_account: string;
    user_id: string; // Added user_id property
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  users: any[]; // Added users property
}
