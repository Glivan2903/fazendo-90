
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Função para buscar todos os usuários do Supabase
export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log("Buscando usuários do Supabase...");
    
    // Buscar diretamente da tabela profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }

    if (!profiles || profiles.length === 0) {
      console.log("Nenhum usuário encontrado no Supabase");
      return [];
    }
    
    console.log("Usuários encontrados:", profiles.length);
    
    // Transformar os perfis em objetos User
    return profiles.map(profile => ({
      id: profile.id,
      name: profile.name || "",
      email: profile.email || "",
      avatarUrl: profile.avatar_url,
      role: profile.role || "student",
      plan: profile.plan || "Mensal",
      status: profile.status || "Ativo"
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw error;
  }
};

// Função para atualizar um usuário
export const updateUser = async (user: User): Promise<User> => {
  try {
    console.log("Atualizando usuário:", user);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl,
        role: user.role,
        status: user.status,
        plan: user.plan
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
    
    console.log("Usuário atualizado com sucesso:", data);
    
    return {
      id: data.id,
      name: data.name || "",
      email: data.email || "",
      avatarUrl: data.avatar_url,
      role: data.role,
      plan: data.plan || "Mensal",
      status: data.status
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
};

// Função para criar um usuário
export const createUser = async (user: Partial<User>): Promise<User> => {
  try {
    console.log("Criando usuário:", user);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "student",
        status: user.status || "Ativo",
        plan: user.plan || "Mensal"
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
    
    console.log("Usuário criado com sucesso:", data);
    
    return {
      id: data.id,
      name: data.name || "",
      email: data.email || "",
      avatarUrl: data.avatar_url,
      role: data.role,
      plan: data.plan || "Mensal",
      status: data.status
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};

// Função para excluir um usuário
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log("Excluindo usuário:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao excluir usuário:", error);
      throw error;
    }
    
    console.log("Usuário excluído com sucesso");
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    throw error;
  }
};
