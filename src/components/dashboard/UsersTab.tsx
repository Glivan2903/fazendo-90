
import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import UserTable from "../users/UserTable";
import NewUserDialog from "../users/NewUserDialog";
import { fetchUsers } from "@/api/userApi";

interface UsersTabProps {
  users: User[];
  onEditUser: (user: User) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users: initialUsers, onEditUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "student",
    status: "Ativo"
  });

  // Carregar os usuários do Supabase
  const loadUsers = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const userData = await fetchUsers();
      console.log("Dados carregados:", userData);
      setUsers(userData);
    } catch (err: any) {
      console.error("Erro ao carregar usuários:", err);
      setError(err.message || "Erro ao carregar usuários");
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);
  
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      (user.role && user.role.toLowerCase().includes(search))
    );
  });

  const handleNewUserChange = (field: keyof User, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role || "student",
          status: newUser.status || "Ativo",
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
        toast.error("Erro ao criar usuário: " + profileError.message);
        return;
      }
      
      if (profileData && profileData[0]) {
        const createdUser: User = {
          id: profileData[0].id,
          name: profileData[0].name,
          email: profileData[0].email,
          role: profileData[0].role,
          status: profileData[0].status || "Ativo",
          created_at: profileData[0].created_at
        };
        
        toast.success("Usuário criado com sucesso!");
        setNewUser({
          name: "",
          email: "",
          role: "student",
          status: "Ativo"
        });
        setShowNewUserDialog(false);
        
        // Atualizar a lista de usuários
        setUsers(prevUsers => [...prevUsers, createdUser]);
      }
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário: " + (error.message || "Erro desconhecido"));
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (error) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Erro ao excluir usuário: " + error.message);
        return;
      }
      
      toast.success("Usuário excluído com sucesso!");
      
      // Atualizar a lista de usuários
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário: " + (error.message || "Erro desconhecido"));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-gray-500">Gerenciar alunos, professores e administradores</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={loadUsers}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowNewUserDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar usuários..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <UserTable 
            users={filteredUsers}
            onEditUser={onEditUser}
            onDeleteUser={handleDeleteUser}
            error={error}
          />
        </CardContent>
      </Card>
      
      <NewUserDialog
        isOpen={showNewUserDialog}
        onClose={() => setShowNewUserDialog(false)}
        onCreateUser={handleCreateUser}
        newUser={newUser}
        onNewUserChange={handleNewUserChange}
      />
    </div>
  );
};

export default UsersTab;
