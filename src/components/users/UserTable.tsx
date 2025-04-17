
import React from "react";
import { User } from "@/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
}

const UserTable = ({ users, onEditUser }: UserTableProps) => {
  return (
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
        {users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "coach"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role === "admin"
                    ? "Administrador"
                    : user.role === "coach"
                    ? "Professor"
                    : "Aluno"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.status}
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
              Nenhum usuário encontrado
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
