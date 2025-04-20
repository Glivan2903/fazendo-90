
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import DeleteUserDialog from './DeleteUserDialog';
import { useDeleteUser } from '@/hooks/useDeleteUser';

interface UserProfileActionsProps {
  userId: string;
}

const UserProfileActions: React.FC<UserProfileActionsProps> = ({ userId }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { deleteUser, isDeleting } = useDeleteUser(userId);

  const handleResetPassword = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleSendNotification = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-4">
            <MoreVertical className="w-4 h-4 mr-2" />
            Ações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Ações do Usuário</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleResetPassword}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar Senha
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendNotification}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar Notificação
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar Usuário
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={deleteUser}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default UserProfileActions;
