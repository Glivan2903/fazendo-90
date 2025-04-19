
import React from "react";
import { User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UsersTableProps {
  users: User[];
  onUserClick: (userId: string) => void;
  onApproveUser?: (userId: string, userName: string) => void;
  usersWithPaymentIssues?: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  onUserClick, 
  onApproveUser,
  usersWithPaymentIssues = []
}) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  // Function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case "coach":
        return <Badge className="bg-blue-100 text-blue-800">Professor</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Aluno</Badge>;
    }
  };

  const getStatusBadge = (status: string, userId: string) => {
    // Check if user has payment issues
    const hasPaymentIssues = usersWithPaymentIssues.some(u => u.id === userId);
    
    if (hasPaymentIssues) {
      return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        Pagamento
      </Badge>;
    }
    
    switch (status) {
      case "Ativo":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "Inativo":
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case "Pendente":
        return <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const hasPaymentIssues = usersWithPaymentIssues.some(u => u.id === user.id);
            
            return (
              <TableRow 
                key={user.id} 
                className={`cursor-pointer hover:bg-muted/50 ${hasPaymentIssues ? 'bg-red-50' : ''}`}
              >
                <TableCell className="font-medium" onClick={() => onUserClick(user.id)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || ""} />
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell onClick={() => onUserClick(user.id)}>
                  {user.email}
                </TableCell>
                <TableCell onClick={() => onUserClick(user.id)}>
                  {user.plan || "-"}
                </TableCell>
                <TableCell onClick={() => onUserClick(user.id)}>
                  {getRoleBadge(user.role || "student")}
                </TableCell>
                <TableCell onClick={() => onUserClick(user.id)}>
                  {getStatusBadge(user.status || "Inativo", user.id)}
                </TableCell>
                <TableCell onClick={() => onUserClick(user.id)}>
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell>
                  {user.status === "Pendente" && onApproveUser && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 border-amber-300 hover:bg-amber-100 text-amber-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApproveUser(user.id, user.name);
                      }}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Aprovar</span>
                    </Button>
                  )}
                  
                  {hasPaymentIssues && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 border-red-300 hover:bg-red-100 text-red-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserClick(user.id);
                      }}
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Ver Detalhes</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
