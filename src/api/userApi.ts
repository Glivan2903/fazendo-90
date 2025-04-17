
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      console.warn("Nenhum usuário encontrado no banco de dados");
      return [];
    }
    
    console.log("Usuários encontrados:", profiles.length);
    
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
      weight: profile.weight || undefined,
      gender: profile.gender || undefined,
      address: profile.address || undefined,
      membership_date: profile.membership_date || undefined,
      plan: profile.plan || 'Mensal',
      status: profile.status || 'Ativo'
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw error;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    // Log de diagnóstico
    console.log("Atualizando usuário:", user);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl || user.avatar_url,
        role: user.role,
        phone: user.phone,
        birth_date: user.birth_date,
        weight: user.weight,
        gender: user.gender,
        address: user.address,
        membership_date: user.membership_date,
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
      plan: data.plan || user.plan,
      status: data.status || user.status
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
};
