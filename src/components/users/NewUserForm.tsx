
import React from "react";
import { User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewUserFormProps {
  showDialog: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  newUser: Partial<User>;
  onUpdateNewUser: (field: string, value: any) => void;
}

const NewUserForm = ({
  showDialog,
  onClose,
  onSave,
  newUser,
  onUpdateNewUser,
}: NewUserFormProps) => {
  const handleSubmit = () => {
    if (!newUser.name || !newUser.email) return;
    onSave(newUser as User);
  };

  return (
    <Dialog open={showDialog} onOpenChange={onClose}>
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
              onChange={(e) => onUpdateNewUser("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => onUpdateNewUser("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => onUpdateNewUser("role", value)}
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
              onValueChange={(value) => onUpdateNewUser("status", value)}
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Criar Usuário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserForm;
