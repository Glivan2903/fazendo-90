
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log("Buscando usuários do Supabase...");
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*, planos_financeiros(nome)')
      .order('name');
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao carregar usuários");
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log("Nenhum usuário encontrado no Supabase");
      return [];
    }
    
    console.log("Usuários encontrados:", profiles.length);
    
    return profiles.map(profile => ({
      id: profile.id,
      name: profile.name || "",
      email: profile.email || "",
      avatarUrl: profile.avatar_url,
      role: profile.role || "student",
      status: profile.status || "Ativo",
      plano_id: profile.plano_id,
      plan: profile.planos_financeiros?.nome || ""
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    toast.error("Erro ao carregar usuários");
    return [];
  }
};

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
        plano_id: user.plano_id
      })
      .eq('id', user.id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário");
      throw error;
    }
    
    console.log("Usuário atualizado com sucesso:", data);
    toast.success("Usuário atualizado com sucesso!");
    
    return {
      id: data.id,
      name: data.name || "",
      email: data.email || "",
      avatarUrl: data.avatar_url,
      role: data.role,
      status: data.status,
      plano_id: data.plano_id
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    toast.error("Erro ao atualizar usuário");
    throw error;
  }
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  try {
    console.log("Criando usuário:", user);
    
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    
    if (checkError) {
      console.error("Erro ao verificar existência do usuário:", checkError);
      toast.error("Erro ao verificar existência do usuário");
      throw checkError;
    }
    
    if (existingUser) {
      const errorMessage = "Já existe um usuário com este email";
      console.error(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const userId = user.id || crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || "student",
        status: user.status || "Ativo",
        plano_id: user.plano_id || null
      }])
      .select('*')
      .single();
    
    if (error) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário");
      throw error;
    }
    
    console.log("Usuário criado com sucesso:", data);
    toast.success("Usuário criado com sucesso!");
    
    return {
      id: data.id,
      name: data.name || "",
      email: data.email || "",
      avatarUrl: data.avatar_url,
      role: data.role,
      status: data.status,
      plano_id: data.plano_id
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    toast.error("Erro ao criar usuário");
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log("Excluindo usuário:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
      throw error;
    }
    
    console.log("Usuário excluído com sucesso");
    toast.success("Usuário excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    toast.error("Erro ao excluir usuário");
    throw error;
  }
};
