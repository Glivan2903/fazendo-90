
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
import { supabase } from '@/integrations/supabase/client';

interface UserProfileActionsProps {
  userId: string;
}

const UserProfileActions: React.FC<UserProfileActionsProps> = ({ userId }) => {
  const handleDeleteUser = async () => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário deletado com sucesso');
      // Redirect to users list or dashboard
      window.location.href = '/teacher-dashboard';
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao deletar usuário');
    }
  };

  const handleResetPassword = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleSendNotification = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  return (
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
          onClick={handleDeleteUser}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Deletar Usuário
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileActions;
