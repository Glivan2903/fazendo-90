
import React, { useState } from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UserSearch from "@/components/users/UserSearch";
import UserTable from "@/components/users/UserTable";
import NewUserForm from "@/components/users/NewUserForm";
import { toast } from "sonner";

interface UsersTabProps {
  users: User[];
  onEditUser: (user: User) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onEditUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "student",
    status: "Ativo"
  });

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.role && user.role.toLowerCase().includes(search))
    );
  });

  const handleCreateUser = (userData: User) => {
    if (!userData.name || !userData.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    onEditUser({
      ...userData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    });

    setNewUser({
      name: "",
      email: "",
      role: "student",
      status: "Ativo"
    });
    setShowNewUserDialog(false);
  };

  const handleUpdateNewUser = (field: string, value: any) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-gray-500">
            Gerenciar alunos, professores e administradores
          </p>
        </div>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setShowNewUserDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <UserSearch 
        searchTerm={searchTerm} 
        onSearch={setSearchTerm} 
      />

      <Card>
        <CardContent className="p-0">
          <UserTable 
            users={filteredUsers} 
            onEditUser={onEditUser} 
          />
        </CardContent>
      </Card>

      <NewUserForm
        showDialog={showNewUserDialog}
        onClose={() => setShowNewUserDialog(false)}
        onSave={handleCreateUser}
        newUser={newUser}
        onUpdateNewUser={handleUpdateNewUser}
      />
    </div>
  );
};

export default UsersTab;
