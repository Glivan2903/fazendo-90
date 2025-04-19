
import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, UserCheck, AlertCircle, DollarSign } from 'lucide-react';
import UsersProfileView from "./UsersProfileView";
import UsersSearch from "./users/UsersSearch";
import UsersTable from "./users/UsersTable";
import CreateUserDialog from "./users/CreateUserDialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ApproveUserDialog from "./ApproveUserDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";

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
  const [usersWithPaymentIssues, setUsersWithPaymentIssues] = useState<User[]>([]);
  
  // Fetch payment data to identify users with payment issues
  const { payments } = usePaymentHistory();
  
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  
  useEffect(() => {
    if (payments && users.length > 0) {
      // Find users with overdue or pending payments
      const userIds = new Set(
        payments
          .filter(payment => payment.status === 'pending' || payment.status === 'overdue')
          .map(payment => payment.user_id)
      );
      
      const usersWithIssues = users.filter(user => userIds.has(user.id));
      setUsersWithPaymentIssues(usersWithIssues);
    }
  }, [payments, users]);

  const handleApproveUser = (userId: string, userName: string) => {
    setUserToApprove({ id: userId, name: userName });
    setApproveDialogOpen(true);
  };

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
      (statusFilter === "pending" && user.status === "Pendente") ||
      (statusFilter === "payment_issues" && usersWithPaymentIssues.some(u => u.id === user.id));
      
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
  
  const activeUsersCount = users.filter(user => user.status === "Ativo").length;
  const inactiveUsersCount = users.filter(user => user.status === "Inativo").length;
  const pendingUsersCount = users.filter(user => user.status === "Pendente").length;
  const paymentIssuesCount = usersWithPaymentIssues.length;
  
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
      
      {/* Pending users notification */}
      {pendingUsersCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-amber-600 mr-2" />
            <span className="text-amber-800">
              {pendingUsersCount} {pendingUsersCount === 1 ? 'usuário pendente' : 'usuários pendentes'} de aprovação
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-amber-300 hover:bg-amber-100 text-amber-800"
            onClick={() => setStatusFilter("pending")}
          >
            Ver pendentes
          </Button>
        </div>
      )}
      
      {/* Payment issues notification */}
      {paymentIssuesCount > 0 && (
        <Card className="bg-red-50 border border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <DollarSign className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">
                {paymentIssuesCount} {paymentIssuesCount === 1 ? 'usuário' : 'usuários'} com pagamento pendente
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-red-700 text-sm">
                Existem {paymentIssuesCount} usuários com pagamentos pendentes ou atrasados que precisam de atenção.
              </p>
              <Button 
                size="sm" 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setStatusFilter("payment_issues")}
              >
                Ver usuários
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* User stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-500">Total de Usuários</div>
          <div className="text-2xl font-bold mt-1">{users.length}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-500">Usuários Ativos</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{activeUsersCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-500">Usuários Pendentes</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{pendingUsersCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-500">Pagamentos Pendentes</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{paymentIssuesCount}</div>
        </div>
      </div>
      
      <UsersSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showPendingFilter={true}
        showPaymentIssuesFilter={true}
      />
      
      <UsersTable 
        users={filteredUsers}
        onUserClick={setSelectedUserId}
        onApproveUser={handleApproveUser}
        usersWithPaymentIssues={usersWithPaymentIssues}
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
