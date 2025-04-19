import React from "react";
import { User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import PaymentConfirmDialog from "./PaymentConfirmDialog";

interface UsersTableProps {
  users: User[];
  onUserClick: (userId: string) => void;
  onApproveUser?: (userId: string, userName: string) => void;
  onRefresh: () => Promise<void>;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  onUserClick, 
  onApproveUser,
  onRefresh 
}) => {
  const [selectedUser, setSelectedUser] = React.useState<{id: string, name: string} | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);

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

  const getStatusBadge = (status: string) => {
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

  const handlePaymentClick = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setShowPaymentDialog(true);
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
          {users.map((user) => (
            <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
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
                {getStatusBadge(user.status || "Inativo")}
              </TableCell>
              <TableCell onClick={() => onUserClick(user.id)}>
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell>
                {user.status === "Pendente" && onApproveUser && (
                  <>
                    {!user.plan ? (
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
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 border-green-300 hover:bg-green-100 text-green-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentClick(user.id, user.name);
                        }}
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Pagamento</span>
                      </Button>
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <PaymentConfirmDialog 
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          userId={selectedUser.id}
          userName={selectedUser.name}
          onConfirmed={onRefresh}
        />
      )}
    </div>
  );
};

export default UsersTable;
