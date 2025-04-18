
import React from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface UsersTableProps {
  users: User[];
  onUserClick: (userId: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onUserClick }) => {
  const getRoleDisplay = (role: string | undefined) => {
    switch(role) {
      case "admin":
        return { text: "Administrador", classes: "bg-purple-100 text-purple-800" };
      case "coach":
        return { text: "Professor", classes: "bg-blue-100 text-blue-800" };
      case "student":
        return { text: "Aluno", classes: "bg-green-100 text-green-800" };
      default:
        return { text: role || "Desconhecido", classes: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => {
                const roleInfo = getRoleDisplay(user.role);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={() => onUserClick(user.id)}
                    >
                      {user.name}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={() => onUserClick(user.id)}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.classes}`}>
                        {roleInfo.text}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  {users.length === 0 ? "Nenhum usuário cadastrado" : "Nenhum usuário encontrado com esse termo de pesquisa"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
