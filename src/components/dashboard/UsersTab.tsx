import React, { useState, useEffect } from "react";
import { User } from "@/types";
import UsersProfileView from "./UsersProfileView";
import UsersSearch from "./users/UsersSearch";
import UsersTable from "./users/UsersTable";
import CreateUserDialog from "./users/CreateUserDialog";
import ApproveUserDialog from "./ApproveUserDialog";
import UsersHeader from "./users/UsersHeader";
import UserStats from "./users/UserStats";
import PendingUsersAlert from "./users/PendingUsersAlert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [userToApprove, setUserToApprove] = useState<{id: string, name: string} | null>(null);
  
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleApproveUser = (userId: string, userName: string) => {
    setUserToApprove({ id: userId, name: userName });
    setApproveDialogOpen(true);
  };

  const pendingUsersCount = users.filter(user => user.status === "Pendente").length;
  
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
      (statusFilter === "inactive" && user.status === "Inativo") ||
      (statusFilter === "pending" && user.status === "Pendente");
      
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Instead of using RPC with catch, let's use a try-catch properly
      // We'll manually check subscriptions by querying the subscriptions table
      try {
        await supabase.rpc('get_user_role', { user_id: 'system' });
        // The actual call might fail but that's fine, it's just to trigger a connection
      } catch (rpcError) {
        // Ignore this error, it's expected
        console.log("RPC call failed, but that's okay:", rpcError);
      }
      
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
      <UsersHeader 
        onRefresh={handleRefresh}
        onNewUser={() => setShowNewUserDialog(true)}
        isRefreshing={isRefreshing}
      />
      
      <PendingUsersAlert
        pendingUsersCount={pendingUsersCount}
        onViewPending={() => setStatusFilter("pending")}
      />
      
      <UserStats 
        users={users}
        pendingUsersCount={pendingUsersCount}
      />
      
      <UsersSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showPendingFilter={true}
      />
      
      <UsersTable 
        users={filteredUsers}
        onUserClick={setSelectedUserId}
        onApproveUser={handleApproveUser}
      />
      
      <CreateUserDialog
        isOpen={showNewUserDialog}
        onClose={() => setShowNewUserDialog(false)}
        onSuccess={handleRefresh}
      />

      {userToApprove && (
        <ApproveUserDialog
          open={approveDialogOpen}
          onOpenChange={setApproveDialogOpen}
          userId={userToApprove.id}
          userName={userToApprove.name}
          onApproved={handleRefresh}
        />
      )}
    </div>
  );
};

export default UsersTab;
