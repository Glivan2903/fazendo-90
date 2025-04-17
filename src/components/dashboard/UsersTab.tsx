
import React, { useState } from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  
  const handleCreateUser = async () => {
    // Validar campos
    if (!newUser.name || !newUser.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      // Criar perfil diretamente no Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(), // Gerar ID para usuário sem auth
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
        // Criar objeto de usuário completo
        const createdUser: User = {
          id: profileData[0].id,
          name: profileData[0].name,
          email: profileData[0].email,
          role: profileData[0].role,
          status: profileData[0].status || "Ativo",
          created_at: profileData[0].created_at
        };
        
        toast.success("Usuário criado com sucesso!");
        
        // Reset form and close dialog
        setNewUser({
          name: "",
          email: "",
          role: "student",
          status: "Ativo"
        });
        setShowNewUserDialog(false);
        
        // Callback para atualizar a lista
        onEditUser(createdUser);
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
      
      // Simular uma edição para atualizar a lista de usuários
      const dummyUser: User = {
        id: userId,
        name: "",
        email: "",
        role: "",
        created_at: ""
      };
      onEditUser(dummyUser);
      
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
        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowNewUserDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin" || user.role === "Admin" || user.role === "Administrador"
                          ? "bg-purple-100 text-purple-800" 
                          : user.role === "coach" || user.role === "Coach" || user.role === "Professor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}>
                        {user.role === "admin" || user.role === "Admin" || user.role === "Administrador"
                          ? "Administrador" 
                          : user.role === "coach" || user.role === "Coach" || user.role === "Professor" 
                            ? "Professor" 
                            : "Aluno"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.status || "Ativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => onEditUser(user)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    {searchTerm ? 
                      "Nenhum usuário encontrado com esse termo de pesquisa" : 
                      "Nenhum usuário cadastrado"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* New User Dialog */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Aluno</SelectItem>
                  <SelectItem value="coach">Professor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTab;
