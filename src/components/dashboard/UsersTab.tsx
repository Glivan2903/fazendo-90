
import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import UsersProfileView from "./UsersProfileView";
import UsersSearch from "./users/UsersSearch";
import UsersTable from "./users/UsersTable";
import CreateUserDialog from "./users/CreateUserDialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsersTabProps {
  users: User[];
  onEditUser: (user: User) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users: initialUsers, onEditUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filteredUsers = users.filter((user) => {
    // Apply text search filter
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.role && user.role.toLowerCase().includes(search));
      
    // Apply status filter if not "all"
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && user.status === "Ativo") ||
      (statusFilter === "inactive" && user.status === "Inativo");
      
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger update of expired subscriptions using a direct query
      // instead of RPC since there's a type mismatch
      await supabase.from('functions_invoke').select('*').eq('name', 'check_expired_subscriptions');
      
      // Fetch updated users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Transform data to match User type
        const transformedUsers = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          role: profile.role,
          status: profile.status,
          plan: profile.plan,
          created_at: profile.created_at
        }));
        
        setUsers(transformedUsers);
        toast.success("Lista de usuários atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.error("Erro ao atualizar lista de usuários");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const activeUsersCount = users.filter(user => user.status === "Ativo").length;
  const inactiveUsersCount = users.filter(user => user.status === "Inativo").length;
  
  // Show profile view if a user is selected
  if (selectedUserId) {
    return (
      <UsersProfileView 
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-gray-500">Gerenciar alunos, professores e administradores</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700" 
            onClick={() => setShowNewUserDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
        </div>
      </div>
      
      {/* User stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-500">Total de Usuários</div>
          <div className="text-2xl font-bold mt-1">{users.length}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-500">Usuários Ativos</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{activeUsersCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-500">Usuários Inativos</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{inactiveUsersCount}</div>
        </div>
      </div>
      
      <UsersSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      
      <UsersTable 
        users={filteredUsers}
        onUserClick={setSelectedUserId}
      />
      
      <CreateUserDialog
        isOpen={showNewUserDialog}
        onClose={() => setShowNewUserDialog(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default UsersTab;
