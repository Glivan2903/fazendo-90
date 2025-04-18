
import React, { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UsersProfileView from "./UsersProfileView";
import UsersSearch from "./users/UsersSearch";
import UsersTable from "./users/UsersTable";
import CreateUserDialog from "./users/CreateUserDialog";

interface UsersTabProps {
  users: User[];
  onEditUser: (user: User) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onEditUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.role && user.role.toLowerCase().includes(search))
    );
  });

  const handleRefresh = () => {
    window.location.reload();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-gray-500">Gerenciar alunos, professores e administradores</p>
        </div>
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-700" 
          onClick={() => setShowNewUserDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>
      
      <UsersSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
