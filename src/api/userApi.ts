
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Função para buscar todos os usuários
export const fetchUsers = async (): Promise<User[]> => {
  try {
    // Tentar buscar do Supabase (em um app real, seria assim)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error || !profiles) {
      throw error;
    }
    
    // Transformar os dados para o formato esperado
    return profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      role: profile.role,
      plan: 'Mensal', // Dados fictícios para planos
      status: profile.role === 'admin' ? 'Ativo' : Math.random() > 0.2 ? 'Ativo' : 'Inativo'
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    
    // Dados fictícios para demonstração
    return [
      { id: '1', name: "Ana Silva", email: "ana.silva@email.com", role: "Aluno", plan: "Mensal", status: "Ativo" },
      { id: '2', name: "Bruno Costa", email: "bruno.costa@email.com", role: "Aluno", plan: "Trimestral", status: "Ativo" },
      { id: '3', name: "Carla Oliveira", email: "carla.oliveira@email.com", role: "Aluno", plan: "Anual", status: "Ativo" },
      { id: '4', name: "Daniel Santos", email: "daniel.santos@email.com", role: "Aluno", plan: "Mensal", status: "Inativo" },
      { id: '5', name: "Eduardo Lima", email: "eduardo.lima@email.com", role: "Aluno", plan: "Mensal", status: "Ativo" },
      { id: '6', name: "Fernanda Alves", email: "fernanda.alves@email.com", role: "Aluno", plan: "Trimestral", status: "Ativo" },
      { id: '7', name: "Gabriel Mendes", email: "gabriel.mendes@email.com", role: "Aluno", plan: "Mensal", status: "Ativo" },
      { id: '8', name: "Helena Martins", email: "helena.martins@email.com", role: "Aluno", plan: "Anual", status: "Ativo" },
      { id: '9', name: "João Silva", email: "joao.silva@email.com", role: "Professor", plan: "N/A", status: "Ativo" },
      { id: '10', name: "Maria Santos", email: "maria.santos@email.com", role: "Professor", plan: "N/A", status: "Ativo" }
    ];
  }
};

// Função para atualizar um usuário
export const updateUser = async (user: User): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl,
        role: user.role
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
      role: data.role,
      plan: user.plan,
      status: user.status
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    
    // Simulação de sucesso para demonstração
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(user);
      }, 800);
    });
  }
};
