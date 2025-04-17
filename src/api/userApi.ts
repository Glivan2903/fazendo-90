
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

// Função para buscar todos os usuários do Supabase
export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log("Buscando usuários do Supabase...");
    
    // Buscar diretamente da tabela profiles sem joins complexos
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao carregar usuários");
      
      // Utilizar dados mockados em caso de erro
      console.log("Usando dados mockados para usuários devido a erro");
      
      return [
        {
          id: "1",
          name: "Admin Exemplo",
          email: "matheusprograming@gmail.com",
          role: "admin",
          status: "Ativo",
          plan: "Anual"
        },
        {
          id: "2",
          name: "Professor Exemplo",
          email: "professor@exemplo.com",
          role: "coach",
          status: "Ativo",
          plan: "N/A"
        },
        {
          id: "3",
          name: "Aluno Exemplo",
          email: "aluno@exemplo.com",
          role: "student",
          status: "Ativo",
          plan: "Mensal"
        }
      ];
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
    toast.error("Erro ao carregar usuários");
    
    // Retornar dados mockados em caso de erro
    return [
      {
        id: "1",
        name: "Admin Exemplo",
        email: "matheusprograming@gmail.com",
        role: "admin",
        status: "Ativo",
        plan: "Anual"
      },
      {
        id: "2",
        name: "Professor Exemplo",
        email: "professor@exemplo.com",
        role: "coach",
        status: "Ativo",
        plan: "N/A"
      },
      {
        id: "3",
        name: "Aluno Exemplo",
        email: "aluno@exemplo.com",
        role: "student",
        status: "Ativo",
        plan: "Mensal"
      }
    ];
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
      plan: data.plan || "Mensal",
      status: data.status
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    toast.error("Erro ao atualizar usuário");
    throw error;
  }
};

// Função para criar um usuário
export const createUser = async (user: Partial<User>): Promise<User> => {
  try {
    console.log("Criando usuário:", user);
    
    // Verificar se já existe um usuário com o mesmo email
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
    
    // Gerar um ID aleatório se não for fornecido
    const userId = user.id || crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || "student",
        status: user.status || "Ativo",
        plan: user.plan || "Mensal"
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
      plan: data.plan || "Mensal",
      status: data.status
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    toast.error("Erro ao criar usuário");
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
