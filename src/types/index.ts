
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  status: string;
  plan?: string;
  phone?: string;
  birth_date?: string;
  plano_id?: string;
  lastCheckInDate?: string;
  registrationDate?: string;
};

export type Class = {
  // Database properties
  id: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  program_id?: string;
  coach_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Frontend properties
  startTime: Date;
  endTime: Date;
  programName: string;
  coachName: string;
  coachAvatar?: string;
  attendeeCount: number;
  spotsLeft: number;
  isCheckedIn: boolean;
  maxCapacity?: number; // Alias for max_capacity for frontend use
  
  // Optional properties used in some components
  program?: { id: string; name: string };
  coach?: { id: string; name: string; avatar_url?: string };
};

export type ClassDetail = {
  id: string;
  startTime: Date;
  endTime: Date;
  program: {
    id: string;
    name: string;
  };
  coach: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  maxCapacity: number;
  attendeeCount: number;
};

export type Attendee = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type FinancialPlan = {
  id: string;
  nome: string;
  valor: number;
  duracao_dias: number;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
};

export type Payment = {
  id: string;
  aluno_id: string;
  plano_id?: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado';
  metodo_pagamento?: 'dinheiro' | 'cartao' | 'pix' | 'transferencia';
  comprovante_url?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
};

export type CashFlowEntry = {
  id: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  data_movimento: string;
  categoria?: string;
  pagamento_id?: string;
  created_at?: string;
  updated_at?: string;
};
