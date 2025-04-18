
import React from "react";
import { User } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UsersTableProps {
  users: User[];
  onUserClick: (userId: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onUserClick }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Administrador
          </Badge>
        );
      case "coach":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Professor
          </Badge>
        );
      case "student":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Aluno
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{role}</Badge>
        );
    }
  };

  const getStatusIndicator = (status: string) => {
    if (status === "Ativo") {
      return (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
          <span>Ativo</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
          <span>Inativo</span>
        </div>
      );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="hidden md:table-cell">Plano</TableHead>
            <TableHead className="hidden md:table-cell">Data de Registro</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow 
                key={user.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onUserClick(user.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.plan || "Sem plano"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formatDate(user.created_at)}
                  </div>
                </TableCell>
                <TableCell>{getStatusIndicator(user.status)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
