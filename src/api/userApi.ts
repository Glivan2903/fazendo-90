import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error || !profiles) {
      throw error;
    }
    
    return profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      avatar_url: profile.avatar_url,
      role: profile.role,
      created_at: profile.created_at,
      phone: profile.phone || undefined,
      birth_date: profile.birth_date || undefined,
      plan: 'Mensal',
      status: profile.role === 'admin' ? 'Ativo' : Math.random() > 0.2 ? 'Ativo' : 'Inativo'
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    
    const now = new Date().toISOString();
    return [
      { id: '1', name: "Ana Silva", email: "ana.silva@email.com", role: "Aluno", plan: "Mensal", status: "Ativo", created_at: now, phone: "11 98765-4321", birth_date: "1990-01-15" },
      { id: '2', name: "Bruno Costa", email: "bruno.costa@email.com", role: "Aluno", plan: "Trimestral", status: "Ativo", created_at: now, phone: "11 91234-5678", birth_date: "1985-05-20" },
      { id: '3', name: "Carla Oliveira", email: "carla.oliveira@email.com", role: "Aluno", plan: "Anual", status: "Ativo", created_at: now },
      { id: '4', name: "Daniel Santos", email: "daniel.santos@email.com", role: "Aluno", plan: "Mensal", status: "Inativo", created_at: now },
      { id: '5', name: "Eduardo Lima", email: "eduardo.lima@email.com", role: "Aluno", plan: "Mensal", status: "Ativo", created_at: now },
      { id: '6', name: "Fernanda Alves", email: "fernanda.alves@email.com", role: "Aluno", plan: "Trimestral", status: "Ativo", created_at: now },
      { id: '7', name: "Gabriel Mendes", email: "gabriel.mendes@email.com", role: "Aluno", plan: "Mensal", status: "Ativo", created_at: now },
      { id: '8', name: "Helena Martins", email: "helena.martins@email.com", role: "Aluno", plan: "Anual", status: "Ativo", created_at: now },
      { id: '9', name: "João Silva", email: "joao.silva@email.com", role: "Professor", plan: "N/A", status: "Ativo", created_at: now },
      { id: '10', name: "Maria Santos", email: "maria.santos@email.com", role: "Professor", plan: "N/A", status: "Ativo", created_at: now }
    ];
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        birth_date: user.birth_date,
        weight: user.weight,
        gender: user.gender,
        address: user.address
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      avatar_url: data.avatar_url,
      role: data.role,
      created_at: data.created_at,
      phone: data.phone,
      birth_date: data.birth_date,
      weight: data.weight,
      gender: data.gender,
      address: data.address,
      membership_date: data.membership_date,
      plan: user.plan,
      status: user.status
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
};
